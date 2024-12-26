import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Twilio } from "https://esm.sh/twilio@4.19.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { callId, to, notes } = await req.json();
    console.log('Received request:', { callId, to, notes });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user's Twilio settings
    console.log('Fetching Twilio settings...');
    const { data: settings, error: settingsError } = await supabaseClient
      .from("settings")
      .select("*")
      .single();

    if (settingsError || !settings) {
      console.error('Settings fetch error:', settingsError);
      throw new Error("Twilio settings not found");
    }

    // Initialize Twilio client
    console.log('Initializing Twilio client...');
    const client = new Twilio(
      settings.twilio_account_sid,
      settings.twilio_auth_token
    );

    console.log('Creating Twilio call...');
    const baseUrl = `${req.url.split('/functions/')[0]}/functions/v1`;

    // Create call using Twilio
    const call = await client.calls.create({
      url: `${baseUrl}/twiml`,
      to,
      from: settings.twilio_phone_number,
      statusCallback: `${baseUrl}/call-status`,
      statusCallbackEvent: ['completed'],
    });

    // Update call record with Twilio SID
    console.log('Updating call record with SID:', call.sid);
    const { error: updateError } = await supabaseClient
      .from("calls")
      .update({ twilio_sid: call.sid })
      .eq("id", callId);

    if (updateError) {
      console.error('Call update error:', updateError);
      throw updateError;
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, sid: call.sid }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in create-call function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});