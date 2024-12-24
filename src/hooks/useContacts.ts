import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Contact } from "@/types/contact";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signin");
      }
    };
    checkUser();
  }, [navigate]);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Ensure we always set an array, even if data is null
      setContacts(data || []);
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Error fetching contacts",
        description: (err as Error).message,
        variant: "destructive",
      });
      // Set empty array on error to prevent undefined
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchContacts();

    const contactsSubscription = supabase
      .channel("contacts_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, fetchContacts)
      .subscribe();

    return () => {
      contactsSubscription.unsubscribe();
    };
  }, [fetchContacts]);

  // Always return an array for contacts, never undefined
  return { contacts, loading, error, addContact };
}