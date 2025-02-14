
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types";

interface InitiateCallParams {
  contact?: Contact;
  phone: string;
  notes: string;
}

export function useInitiateCall() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInitiateCall = async ({ contact, phone, notes }: InitiateCallParams) => {
    setIsLoading(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Please sign in to make calls");
      }

      console.log("Fetching Twilio token...");

      // Get token for Twilio client
      const tokenResponse = await fetch("/api/twilio/token", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        console.error("Token fetch error:", errorData);
        throw new Error(errorData.error || "Failed to get Twilio token");
      }

      const { token } = await tokenResponse.json();

      console.log("Creating call...");

      // Create the call
      const callResponse = await fetch("/api/calls/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: phone,
          notes,
          contact_id: contact?.id,
        }),
      });

      if (!callResponse.ok) {
        const error = await callResponse.json();
        throw new Error(error.error || "Failed to initiate call");
      }

      const callData = await callResponse.json();
      
      return {
        success: true,
        callId: callData.id
      };
    } catch (error) {
      console.error('Call creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate call",
        variant: "destructive",
      });
      return {
        success: false,
        callId: undefined
      };
    } finally {
      setIsLoading(false);
    }
  };

  const hangUp = async (callId: string) => {
    try {
      const { error } = await supabase
        .from('calls')
        .update({ 
          status: 'canceled',
          end_time: new Date().toISOString()
        })
        .eq('id', callId);

      if (error) throw error;

      toast({
        title: "Call Ended",
        description: "The call has been terminated",
      });
    } catch (error) {
      console.error('Error hanging up call:', error);
      toast({
        title: "Error",
        description: "Failed to hang up call",
        variant: "destructive",
      });
    }
  };

  return {
    initiateCall: handleInitiateCall,
    hangUp,
    isLoading
  };
}
