
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
      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
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
          user_id: session.user.id,
          notes,
          status: 'initiated'
        }])
        .select()
        .single();

      if (callError) {
        throw new Error("Failed to create call record");
      }

      console.log('Initiating call with data:', {
        callId: callData.id,
        to: phone,
        notes,
      });

      // Initiate call using edge function
      const { data, error: functionError } = await supabase.functions.invoke('create-call', {
        body: {
          callId: callData.id,
          to: phone,
          notes,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw new Error(functionError.message || 'Failed to initiate call');
      }

      if (!data?.success) {
        throw new Error('Failed to initiate call: Unknown error');
      }

      console.log('Call initiated successfully:', data);

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
      
      // Clean up the call record if it was created but the call failed
      if (error instanceof Error && error.message.includes('Failed to initiate call')) {
        // We don't need to await this as it's just cleanup
        supabase
          .from('calls')
          .update({ status: 'failed' })
          .eq('id', error.message.split(':')[1]?.trim());
      }

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
