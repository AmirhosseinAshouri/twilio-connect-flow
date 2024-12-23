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
          .select("*")
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
  }, [toast]);

  const createCall = async (contactPhone: string, notes: string) => {
    try {
      if (!settings) {
        throw new Error("Twilio settings not configured");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Call your backend API to initiate Twilio call
      const response = await fetch("/api/calls/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: contactPhone,
          from: settings.twilio_phone_number,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate call");
      }

      const callData = await response.json();

      // Save call record to database
      const { data, error } = await supabase
        .from("calls")
        .insert([{
          contact_id: callData.contact_id,
          user_id: user.id,
          duration: 0, // Will be updated when call ends
          notes,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Call Initiated",
        description: "Your call is being connected.",
      });

      return data;
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