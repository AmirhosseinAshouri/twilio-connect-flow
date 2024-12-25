import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Communication {
  id: string;
  user_id: string;
  contact_id: string;
  type: 'sms' | 'email';
  direction: 'sent' | 'received';
  content: string;
  subject?: string;
  created_at: string;
}

export function useCommunications(contactId: string) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('communications')
          .select('*')
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setCommunications(data as Communication[]);
      } catch (err) {
        console.error("Error fetching communications:", err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, [contactId]);

  return { communications, loading, error };
}