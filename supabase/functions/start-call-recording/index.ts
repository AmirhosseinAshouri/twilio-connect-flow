import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { callSid } = await req.json();

    if (!callSid) {
      throw new Error('CallSid is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user's Twilio settings
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization required');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('twilio_account_sid, twilio_auth_token')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings) {
      throw new Error('Twilio settings not found');
    }

    // Start recording via Twilio API
    const recordingResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${settings.twilio_account_sid}/Calls/${callSid}/Recordings.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${settings.twilio_account_sid}:${settings.twilio_auth_token}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          RecordingChannels: 'dual',
          RecordingStatusCallback: 'https://fbwxtooicqpqotherube.supabase.co/functions/v1/recording-status'
        }).toString(),
      }
    );

    if (!recordingResponse.ok) {
      const error = await recordingResponse.json();
      console.error('Twilio recording error:', error);
      throw new Error(`Failed to start recording: ${error.message || 'Unknown error'}`);
    }

    const recordingData = await recordingResponse.json();
    console.log('Recording started:', recordingData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        recordingSid: recordingData.sid 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Start recording error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});