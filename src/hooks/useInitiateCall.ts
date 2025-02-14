
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
          contact_id: contact?.id,
          user_id: user.id,
          notes,
          status: 'initiated'
        }])
        .select()
        .single();

      if (callError) {
        throw new Error("Failed to create call record");
      }

      // Initiate call using our edge function
      const response = await supabase.functions.invoke('create-call', {
        body: {
          callId: callData.id,
          to: phone,
          notes,
        }
      });

      if (response.error) {
        console.error('Call initiation error:', response.error);
        throw new Error(response.error.message || 'Failed to initiate call');
      }

      console.log('Call initiated successfully');

      toast({
        title: "Call Initiated",
        description: "Your call is being connected.",
      });

      return {
        success: true,
        callId: callData.id
      };
    } catch (error) {
      console.error('Error in initiateCall:', error);
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
