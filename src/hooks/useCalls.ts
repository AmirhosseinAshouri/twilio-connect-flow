import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Call } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "./useSettings";

export function useCalls() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { settings } = useSettings();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("calls")
          .select("*, contacts(name)")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setCalls(data || []);
      } catch (err) {
        setError(err as Error);
        toast({
          title: "Error fetching calls",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();

    // Subscribe to changes
    const subscription = supabase
      .channel('calls_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calls' }, fetchCalls)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const createCall = async (contactId: string, phone: string, notes: string) => {
    try {
      if (!settings?.twilio_phone_number) {
        toast({
          title: "Error",
          description: "Please configure your Twilio settings in the Settings page first",
          variant: "destructive",
        });
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return null;
      }

      // First create the call record in our database
      const { data: callData, error: callError } = await supabase
        .from("calls")
        .insert([{
          contact_id: contactId,
          user_id: user.id,
          notes,
          status: 'initiated'
        }])
        .select()
        .single();

      if (callError) {
        toast({
          title: "Error",
          description: "Failed to create call record",
          variant: "destructive",
        });
        return null;
      }

      // Then initiate the call via our API
      const response = await fetch("/api/calls/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callId: callData.id,
          to: phone,
          from: settings.twilio_phone_number,
          notes,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: responseData.error || "Failed to initiate call",
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "Call Initiated",
        description: "Your call is being connected.",
      });

      return callData;
    } catch (err) {
      toast({
        title: "Error creating call",
        description: (err as Error).message,
        variant: "destructive",
      });
      return null;
    }
  };

  return { calls, loading, error, createCall };
}