import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import twilio from "https://esm.sh/twilio@4.19.0";

serve(async (req) => {
<<<<<<< HEAD
  if (req.method === "OPTIONS") {
=======
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
>>>>>>> 3669d4adf2b5f564e43a3df842825f19b1e50af2
    return new Response(null, {
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Max-Age": "86400",
      },
      status: 204,
    });
  }

  try {
<<<<<<< HEAD
    // ✅ No authentication required — open access for Twilio
    const formData = await req.formData();
    const From = formData.get("From") || "+1234567890"; // Default caller
    const To = formData.get("To") || "+0987654321"; // Default recipient

    console.log("Incoming Call From:", From);
    console.log("Dialing To:", To);

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
=======
    const url = new URL(req.url);
    const to = url.searchParams.get('To');
    const from = url.searchParams.get('From');

    console.log('Generating TwiML for call:', { to, from });

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    
    // Add a greeting
    response.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Hello! Please wait while we connect your call.');
>>>>>>> 3669d4adf2b5f564e43a3df842825f19b1e50af2

    response.say("Connecting your call now.");
    response.pause({ length: 1 });

    const dial = response.dial({
<<<<<<< HEAD
      callerId: From,
=======
      callerId: from || '',
>>>>>>> 3669d4adf2b5f564e43a3df842825f19b1e50af2
      timeout: 30,
      record: "record-from-answer",
      answerOnBridge: true,
    });
<<<<<<< HEAD
=======
    
    // Add the number to dial
    dial.number(to || '');
>>>>>>> 3669d4adf2b5f564e43a3df842825f19b1e50af2

    dial.number(To);

    console.log("Generated TwiML:", response.toString());

    return new Response(response.toString(), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Access-Control-Allow-Origin": "*", // ✅ Allow public access
      },
    });
  } catch (error) {
    console.error("Error generating TwiML:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate TwiML response" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
