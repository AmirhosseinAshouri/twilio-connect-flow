import { supabase } from "@/integrations/supabase/client";
import { TwilioSettings } from "@/hooks/useSettings";

export const validateTwilioSettings = async (settings: TwilioSettings | null) => {
  if (!settings?.twilio_phone_number || !settings?.twilio_account_sid || !settings?.twilio_auth_token) {
    return {
      isValid: false,
      error: "Please configure your Twilio settings in the Settings page first"
    };
  }
  return { isValid: true, error: null };
};

export const createCallRecord = async (contactId: string, userId: string, notes: string) => {
  const { data, error } = await supabase
    .from("calls")
    .insert({
      contact_id: contactId,
      user_id: userId,
      notes,
      status: 'initiated'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const initiateCall = async (callId: string, phone: string, notes: string) => {
  return await supabase.functions.invoke('create-call', {
    body: {
      callId,
      to: phone,
      notes,
    }
  });
};