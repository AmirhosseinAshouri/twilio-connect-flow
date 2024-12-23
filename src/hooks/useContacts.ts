import { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("contacts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setContacts(data || []);
      } catch (err) {
        setError(err as Error);
        toast({
          title: "Error fetching contacts",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();

    const contactsSubscription = supabase
      .channel("contacts_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, fetchContacts)
      .subscribe();

    return () => {
      contactsSubscription.unsubscribe();
    };
  }, [toast]);

  const addContact = async (values: Omit<Contact, "id" | "user_id" | "created_at">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("contacts")
        .insert([{ ...values, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Contact Added",
        description: `${values.name} has been added successfully.`,
      });

      return data;
    } catch (err) {
      toast({
        title: "Error adding contact",
        description: (err as Error).message,
        variant: "destructive",
      });
      return null;
    }
  };

  return { contacts, loading, error, addContact };
} 