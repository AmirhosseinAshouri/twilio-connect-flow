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
      if (!settings) {
        throw new Error("Twilio settings not configured");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

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

      if (callError) throw callError;

      // Then initiate the call via our API
      const response = await fetch("/api/calls/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          callId: callData.id,
          to: phone,
          from: settings.twilio_phone_number,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initiate call");
      }

      const responseData = await response.json();
      
      // Update call with Twilio SID
      await supabase
        .from("calls")
        .update({ twilio_sid: responseData.sid })
        .eq("id", callData.id);

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