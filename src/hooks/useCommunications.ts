import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Communication, CommunicationType, CommunicationDirection } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useCommunications(contactId?: string) {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        let query = supabase
          .from("communications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (contactId) {
          query = query.eq("contact_id", contactId);
        }

        const { data, error: dbError } = await query;

        if (dbError) throw dbError;

        // Cast the data to ensure type safety
        const typedCommunications: Communication[] = (data || []).map(item => ({
          ...item,
          type: item.type as CommunicationType,
          direction: item.direction as CommunicationDirection
        }));

        setCommunications(typedCommunications);
      } catch (err) {
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

    // Subscribe to changes
    const subscription = supabase
      .channel('communications_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'communications',
          filter: contactId ? `contact_id=eq.${contactId}` : undefined
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newComm = payload.new as Communication;
            setCommunications(prev => [
              {
                ...newComm,
                type: newComm.type as CommunicationType,
                direction: newComm.direction as CommunicationDirection
              },
              ...prev
            ]);
            toast({
              title: "New Communication",
              description: `New ${newComm.type} received`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [contactId, toast]);

  return { communications, loading, error };
}

export type { Communication };