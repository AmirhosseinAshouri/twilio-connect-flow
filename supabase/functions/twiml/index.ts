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
    let caller = "";
    let recipient = "";

    // ✅ Get Content-Type safely
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      // ✅ Parse Twilio's form-data request
      const formData = new URLSearchParams(await req.text());
      caller = formData.get("From") || "";
      recipient = formData.get("To") || "";
    } else if (contentType.includes("application/json")) {
      // ✅ Handle JSON payloads
      const jsonBody = await req.json();
      caller = jsonBody.From || "";
      recipient = jsonBody.To || "";
    } else {
      console.error("❌ Invalid content type or missing content-type header.");
      return new Response(
        JSON.stringify({ error: "Unsupported content type. Use JSON or form-urlencoded." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400, // Bad Request
        }
      );
    }

    console.log("📞 Call request received. From:", caller, "To:", recipient);

    if (!caller || !recipient) {
      return new Response(
        JSON.stringify({ error: "Missing caller or recipient number" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // ✅ Manually generate TwiML XML response
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Please hold while we connect your call.</Say>
  <Dial callerId="${caller}" record="record-from-answer" timeout="30" answerOnBridge="true">
    <Number>${recipient}</Number>
  </Dial>
</Response>`;

    console.log("📞 Generated TwiML:", twimlResponse);

    return new Response(twimlResponse, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
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
