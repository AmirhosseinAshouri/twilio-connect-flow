import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import twilio from "https://esm.sh/twilio@4.19.0";

serve(async (req) => {
  if (req.method === "OPTIONS") {
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
    // ✅ No authentication required — open access for Twilio
    const formData = await req.formData();
    const From = formData.get("From") || "+1234567890"; // Default caller
    const To = formData.get("To") || "+0987654321"; // Default recipient

    console.log("Incoming Call From:", From);
    console.log("Dialing To:", To);

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    response.say("Connecting your call now.");
    response.pause({ length: 1 });

    const dial = response.dial({
      callerId: From,
      timeout: 30,
      record: "record-from-answer",
      answerOnBridge: true,
    });

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
