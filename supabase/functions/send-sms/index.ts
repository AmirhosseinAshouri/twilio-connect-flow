import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  to: string;
  message: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.split(' ')[1]
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Not authenticated');
    }

    console.log('Authenticated user:', user.id);

    // Get the user's Twilio settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('twilio_account_sid, twilio_auth_token, twilio_phone_number')
      .eq('user_id', user.id)
      .single();

    if (settingsError) {
      console.error('Settings error:', settingsError);
      throw new Error('Failed to fetch Twilio settings');
    }

    if (!settings?.twilio_account_sid || !settings?.twilio_auth_token || !settings?.twilio_phone_number) {
      throw new Error('Twilio settings not configured. Please configure them in the Settings page.');
    }

    console.log('Successfully retrieved Twilio settings');

    const { to, message }: SMSRequest = await req.json();

    // Send SMS using Twilio
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${settings.twilio_account_sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${settings.twilio_account_sid}:${settings.twilio_auth_token}`),
        },
        body: new URLSearchParams({
          To: to,
          From: settings.twilio_phone_number,
          Body: message,
        }),
      }
    );

    const result = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio error:', result);
      throw new Error(result.message || 'Failed to send SMS');
    }

    console.log('SMS sent successfully:', result.sid);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in send-sms function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});