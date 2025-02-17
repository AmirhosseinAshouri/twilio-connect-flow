import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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
    // ✅ Twilio sends form-data, not JSON
    const formData = await req.formData();
    const From = formData.get("From") || "+1234567890"; // Default caller
    const To = formData.get("To") || "+0987654321"; // Default recipient

    console.log("Incoming Call From:", From);
    console.log("Dialing To:", To);

    // ✅ Manually generate TwiML response
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say>Connecting your call now.</Say>
      <Pause length="1"/>
      <Dial callerId="${From}" timeout="30" answerOnBridge="true">
        <Number>${To}</Number>
      </Dial>
    </Response>`;

    console.log("Generated TwiML:", twimlResponse);

    return new Response(twimlResponse, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Access-Control-Allow-Origin": "*", // ✅ Allow public access
      },
    });
  } catch (error) {
    console.error("❌ Error generating TwiML:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate TwiML response" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
