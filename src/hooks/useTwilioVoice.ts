import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Contact } from "@/types";

interface InitiateCallParams {
  contact: Contact;
  phone: string;
  notes: string;
}

export function useTwilioVoice() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initiateCall = async ({ contact, phone, notes }: InitiateCallParams) => {
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // First check if Twilio settings exist
      const { data: settings, error: settingsError } = await supabase
        .from("settings")
        .select("twilio_account_sid, twilio_auth_token, twilio_phone_number")
        .single();

      if (settingsError || !settings) {
        throw new Error("Please configure your Twilio settings in the Settings page first");
      }

      if (!settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_phone_number) {
        throw new Error("Please complete your Twilio settings configuration");
      }

      // Create call record
      const { data: callData, error: callError } = await supabase
        .from("calls")
        .insert([{
          contact_id: contact.id,
          user_id: user.id,
          notes,
          status: 'initiated'
        }])
        .select()
        .single();

      if (callError) {
        throw new Error("Failed to create call record");
      }

      // Initiate call
      const response = await fetch('/api/calls/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callId: callData.id,
          to: phone,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Call initiation error:', errorData);
        throw new Error(errorData.error || 'Failed to initiate call');
      }

      console.log('Call initiated successfully');

      toast({
        title: "Call Initiated",
        description: "Your call is being connected.",
      });

      return true;
    } catch (error) {
      console.error('Error in initiateCall:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate call",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiateCall,
    isLoading
  };
}