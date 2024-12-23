import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ErrorState } from "@/components/ErrorState";

export function useContact(id: string) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        setError(null);
        
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

  return { contact, loading, error };
} 