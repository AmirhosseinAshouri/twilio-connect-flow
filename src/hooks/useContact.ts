import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types/contact";
import { useToast } from "@/hooks/use-toast";

export function useContact(id: string) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContact = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast({
          title: "Error fetching contact",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setContact({
        id: data.id,
        name: data.full_name,
        email: data.email,
        phone: '',
        company: '',
        user_id: data.id,
        created_at: data.created_at
      });
      setLoading(false);
    };

    fetchContact();
  }, [id, toast]);

  return { contact, loading };
} 