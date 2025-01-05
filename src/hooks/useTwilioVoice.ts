import { useState } from 'react';
import { useToast } from './use-toast';
import { supabase } from "@/integrations/supabase/client";

export function useTwilioVoice() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const makeCall = async (to: string) => {
    try {
      setIsConnecting(true);
      
      // Get user's Twilio settings
      const { data: settings, error: settingsError } = await supabase
        .from("settings")
        .select("twilio_account_sid, twilio_auth_token, twilio_phone_number")
        .single();

      if (settingsError) {
        throw new Error("Failed to fetch Twilio settings");
      }

      if (!settings?.twilio_account_sid || !settings?.twilio_auth_token || !settings?.twilio_phone_number) {
        throw new Error("Please configure your Twilio settings in the Settings page");
      }

      // Create a new call record
      const { data: callData, error: callError } = await supabase
        .from("calls")
        .insert([{
          to,
          status: 'initiated',
          notes: '',
        }])
        .select()
        .single();

      if (callError) throw callError;

      // Initiate the call using our API
      const response = await fetch('/api/calls/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callId: callData.id,
          to,
          from: settings.twilio_phone_number,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate call');
      }

      toast({
        title: "Call Initiated",
        description: "Connecting your call...",
      });

      return true;
    } catch (error) {
      console.error('Error making call:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate call",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    makeCall,
    isConnecting,
  };
}