import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // ✅ Ensure you're using the SERVICE ROLE key
    );

    // 🛑 Debug: Check if ENV variables are loaded
    console.log("Supabase URL:", Deno.env.get("SUPABASE_URL"));
    console.log("Supabase Key:", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    // Get the JWT token from the request header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing Authorization header");
      throw new Error("No authorization header");
    }

    // Validate JWT and get user ID
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      console.error("Invalid token error:", userError);
      throw new Error("Invalid token");
    }

    const { callId, to, notes } = await req.json();
    console.log("Received request:", { callId, to, notes });

    // 🛑 Debug: Fetch Twilio settings from Supabase
    const { data: settings, error: settingsError } = await supabaseClient
      .from("settings")
      .select("twilio_account_sid, twilio_auth_token, twilio_phone_number")
      .eq("user_id", user.id)
      .single();

    console.log("Supabase Settings Response:", settings, settingsError);

    if (settingsError || !settings) {
      console.error("Twilio settings fetch error:", settingsError);
      throw new Error("Failed to fetch Twilio settings");
    }

    if (!settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_phone_number) {
      console.error("Incomplete Twilio settings:", settings);
      throw new Error("Incomplete Twilio settings");
    }

    const twimlUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/twiml`;
    const statusCallbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/call-status`;

    // 🛑 Debug: Check Twilio API request before sending
    console.log("Twilio API Request Data:", {
      To: to,
      From: settings.twilio_phone_number,
      Url: twimlUrl,
      StatusCallback: statusCallbackUrl,
    });

    // Make request to Twilio API
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${settings.twilio_account_sid}/Calls.json`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${settings.twilio_account_sid}:${settings.twilio_auth_token}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          From: settings.twilio_phone_number,
          Url: twimlUrl,
          StatusCallback: statusCallbackUrl,
          StatusCallbackEvent: JSON.stringify(["completed"]),
        }).toString(),
      }
    );

    if (!twilioResponse.ok) {
      const twilioError = await twilioResponse.json();
      console.error("Twilio API error:", twilioError);
      throw new Error(`Twilio API error: ${twilioError.message || "Unknown error"}`);
    }

    const twilioData = await twilioResponse.json();
    console.log("Twilio call created:", twilioData);

    // 🛑 Debug: Check call update in Supabase
    const { error: updateError } = await supabaseClient
      .from("calls")
      .update({
        twilio_sid: twilioData.sid,
        status: "initiated",
      })
      .eq("id", callId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to update call record");
    }

    return new Response(
      JSON.stringify({ success: true, sid: twilioData.sid }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating call:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
