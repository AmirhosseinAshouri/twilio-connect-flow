import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    console.log('=== TWIML FUNCTION START ===')
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))

    let caller = "";
    let recipient = "";

    // Get Content-Type safely
    const contentType = req.headers.get("content-type") || "";
    console.log('Content-Type:', contentType)

    if (contentType.includes("application/x-www-form-urlencoded")) {
      // Parse Twilio's form-data request
      const formData = new URLSearchParams(await req.text());
      caller = formData.get("From") || "";
      recipient = formData.get("To") || "";
      console.log('Parsed form data - From:', caller, 'To:', recipient)
    } else if (contentType.includes("application/json")) {
      // Handle JSON payloads
      const jsonBody = await req.json();
      caller = jsonBody.From || "";
      recipient = jsonBody.To || "";
      console.log('Parsed JSON data - From:', caller, 'To:', recipient)
    } else {
      // For GET requests, check URL parameters
      const url = new URL(req.url);
      caller = url.searchParams.get("From") || "";
      recipient = url.searchParams.get("To") || "";
      console.log('Parsed URL params - From:', caller, 'To:', recipient)
    }

    console.log("Call request received. From:", caller, "To:", recipient);

    // Generate simple TwiML that just connects the call
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Connecting your call, please wait.</Say>
  <Dial timeout="60" callerId="${caller}">
    <Number>${recipient}</Number>
  </Dial>
</Response>`;

    console.log("Generated TwiML:", twimlResponse);

    return new Response(twimlResponse, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Error generating TwiML:", error);
    
    // Return a simple TwiML response even on error
    const errorTwimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Sorry, there was an error connecting your call. Please try again.</Say>
  <Hangup />
</Response>`;

    return new Response(errorTwimlResponse, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
      },
      status: 200, // Still return 200 for TwiML
    });
  }
});
