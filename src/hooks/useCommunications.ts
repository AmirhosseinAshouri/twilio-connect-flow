import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Communication {
  id: string;
  type: 'sms' | 'email';
  direction: 'sent' | 'received';
  content: string;
  subject?: string;
  created_at: string;
}

export function useCommunications(contactId: string | undefined) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        if (!contactId) return;

        const { data, error } = await supabase
          .from("communications")
          .select("*")
          .eq("contact_id", contactId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setCommunications(data || []);
      } catch (err) {
        console.error("Error fetching communications:", err);
        setError(err as Error);
        toast({
          title: "Error fetching communications",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, [contactId, toast]);

  return { communications, loading, error };
}