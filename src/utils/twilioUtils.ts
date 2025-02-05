import { supabase } from "@/integrations/supabase/client";

export interface TwilioSettings {
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_phone_number: string;
  twilio_twiml_app_sid: string;
}

export const validateTwilioSettings = (settings: TwilioSettings | null): { 
  isValid: boolean;
  error?: string;
  missingSettings?: string[];
} => {
  if (!settings) {
    return { isValid: false, error: "Twilio settings not found" };
  }

  const requiredSettings = [
    'twilio_account_sid',
    'twilio_auth_token',
    'twilio_phone_number',
    'twilio_twiml_app_sid'
  ];

  const missingSettings = requiredSettings.filter(setting => !settings[setting]);
  
  if (missingSettings.length > 0) {
    return { 
      isValid: false, 
      error: `Missing Twilio settings: ${missingSettings.join(', ')}`,
      missingSettings 
    };
  }

  return { isValid: true };
};

export const createCallRecord = async (contactId: string | undefined, userId: string, notes: string) => {
  const { data, error } = await supabase
    .from("calls")
    .insert([{
      contact_id: contactId,
      user_id: userId,
      notes,
      status: 'initiated'
    }])
    .select()
    .single();

  if (error) throw new Error("Failed to create call record");
  return data;
};

export const initiateCall = async (callId: string, to: string, notes: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await fetch('/api/calls/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      callId,
      to,
      notes,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to initiate call');
  }

  return response.json();
};