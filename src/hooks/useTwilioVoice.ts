import { useState } from 'react';
import { useToast } from './use-toast';
import { supabase } from "@/integrations/supabase/client";

export function useTwilioVoice() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const makeCall = async (to: string, contactId: string) => {
    try {
      setIsConnecting(true);
      
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Authentication required");
      }

      // Get user's Twilio settings
      const { data: settings, error: settingsError } = await supabase
        .from("settings")
        .select("twilio_account_sid, twilio_auth_token, twilio_phone_number")
        .eq("user_id", session.user.id)
        .single();

      if (settingsError) {
        console.error('Settings fetch error:', settingsError);
        throw new Error("Failed to fetch Twilio settings");
      }

      if (!settings?.twilio_account_sid || !settings?.twilio_auth_token || !settings?.twilio_phone_number) {
        throw new Error("Please configure your Twilio settings in the Settings page");
      }

      // Create a new call record
      const { data: callData, error: callError } = await supabase
        .from("calls")
        .insert([{
          contact_id: contactId,
          user_id: session.user.id,
          status: 'initiated',
          notes: '',
        }])
        .select()
        .single();

      if (callError) {
        console.error('Call record creation error:', callError);
        throw callError;
      }

      console.log('Created call record:', callData);

      // Initiate the call using our API
      const response = await fetch('/api/calls/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          callId: callData.id,
          to,
          from: settings.twilio_phone_number,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Call initiation error:', responseData);
        throw new Error(responseData.error || 'Failed to initiate call');
      }

      console.log('Call initiated successfully:', responseData);

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