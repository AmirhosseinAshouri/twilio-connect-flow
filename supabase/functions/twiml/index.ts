import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { Twilio } from "https://esm.sh/twilio@4.19.0";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const twiml = new Twilio.twiml.VoiceResponse();
    twiml.say('Hello! This is a call from your CRM system.');
    twiml.pause({ length: 1 });
    twiml.say('Connecting you now.');

    return new Response(twiml.toString(), {
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error('Error in twiml function:', error);
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