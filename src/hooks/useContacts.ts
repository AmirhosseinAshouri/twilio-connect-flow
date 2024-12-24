import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;

      setContacts(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError(err as Error);
      setContacts([]); // Ensure contacts is always an array
      toast({
        title: "Error fetching contacts",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

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

      // Refresh contacts list
      await fetchContacts();

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