import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Twilio from "https://esm.sh/twilio@4.19.0"; // ✅ Correct Import

const { AccessToken, VoiceGrant } = Twilio.jwt; // ✅ Correctly load Twilio JWT components

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // ✅ Get the JWT token from the request header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("❌ No authorization header provided.");
    }

    // ✅ Get the user from the JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("❌ Invalid token, user not found.");
    }

    console.log("🔍 Fetching Twilio settings for user:", user.id);

    // ✅ Get the user's Twilio settings from Supabase
    const { data: settings, error: settingsError } = await supabaseClient
      .from("settings")
      .select("twilio_account_sid, twilio_api_key, twilio_api_secret, twilio_twiml_app_sid")
      .eq("user_id", user.id)
      .single();

    if (settingsError || !settings) {
      console.error("❌ Settings fetch error:", settingsError);
      throw new Error("❌ Failed to fetch Twilio settings.");
    }

    if (!settings.twilio_account_sid || !settings.twilio_api_key || !settings.twilio_api_secret) {
      console.error("❌ Incomplete Twilio settings:", {
        hasTwilioAccountSid: !!settings.twilio_account_sid,
        hasTwilioApiKey: !!settings.twilio_api_key,
        hasTwilioApiSecret: !!settings.twilio_api_secret,
      });

      return new Response(
        JSON.stringify({
          error: "Incomplete Twilio settings",
          details: {
            hasTwilioAccountSid: !!settings.twilio_account_sid,
            hasTwilioApiKey: !!settings.twilio_api_key,
            hasTwilioApiSecret: !!settings.twilio_api_secret,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("✅ Creating Twilio access token...");

    // ✅ Generate Twilio Token properly
    const token = new AccessToken(
      settings.twilio_account_sid,
      settings.twilio_api_key,
      settings.twilio_api_secret,
      { ttl: 3600 } // Token valid for 1 hour
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: settings.twilio_twiml_app_sid || settings.twilio_account_sid,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);

    console.log("✅ Twilio token generated successfully!");

    return new Response(
      JSON.stringify({ token: token.toJwt() }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Token generation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
