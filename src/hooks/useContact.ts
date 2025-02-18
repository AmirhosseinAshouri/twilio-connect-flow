
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useContact(id: string | undefined) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Don't fetch if id is undefined or empty
        if (!id) {
          setContact(null);
          return;
        }

        const { data, error } = await supabase
          .from("contacts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setContact(data);
      } catch (err) {
        setError(err as Error);
        toast({
          title: "Error fetching contact",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id, toast]);

  const updateContact = async (updatedContact: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .update(updatedContact)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setContact(data);
      toast({
        title: "Contact updated",
        description: "The contact has been successfully updated.",
      });

      return data;
    } catch (err) {
      toast({
        title: "Error updating contact",
        description: (err as Error).message,
        variant: "destructive",
      });
      throw err;
    }
  };

  return { contact, loading, error, updateContact };
}
