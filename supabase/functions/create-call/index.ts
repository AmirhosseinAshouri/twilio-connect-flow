import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import twilio from "https://esm.sh/twilio@4.19.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        headers: corsHeaders,
        status: 204
      });
    }

    // Create Supabase client
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
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Not authenticated');
    }

    console.log('Authenticated user:', user.id);

    // Get the request body
    const { contactId, to, notes } = await req.json();
    
    if (!contactId || !to) {
      throw new Error('Missing required fields');
    }

    // Get the user's Twilio settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('twilio_account_sid, twilio_auth_token, twilio_phone_number')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings) {
      console.error('Settings error:', settingsError);
      throw new Error('Failed to fetch Twilio settings');
    }

    if (!settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_phone_number) {
      throw new Error('Twilio settings not configured');
    }

    // Create call record in database first
    const { data: callData, error: callError } = await supabaseClient
      .from('calls')
      .insert([{
        contact_id: contactId,
        user_id: user.id,
        notes,
        status: 'initiated'
      }])
      .select()
      .single();

    if (callError) {
      console.error('Call record creation error:', callError);
      throw new Error('Failed to create call record');
    }

    // Initialize Twilio client
    const client = twilio(settings.twilio_account_sid, settings.twilio_auth_token);

    console.log('Creating Twilio call...');

    const baseUrl = Deno.env.get('VITE_APP_URL') || '';
    
    // Create call using Twilio
    const call = await client.calls.create({
      url: `${baseUrl}/api/calls/twiml`,
      to,
      from: settings.twilio_phone_number,
      statusCallback: `${baseUrl}/api/calls/status`,
      statusCallbackEvent: ['completed'],
    });

    console.log('Call created:', call.sid);

    // Update call record with Twilio SID
    const { error: updateError } = await supabaseClient
      .from('calls')
      .update({ twilio_sid: call.sid })
      .eq('id', callData.id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to update call record');
    }

    return new Response(
      JSON.stringify({ success: true, sid: call.sid, callId: callData.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-call function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});