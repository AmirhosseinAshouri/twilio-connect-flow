import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    // ✅ Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Must use SERVICE ROLE key
    );

    console.log("✅ Supabase URL:", Deno.env.get("SUPABASE_URL"));
    console.log("✅ Supabase Service Role Key Loaded:", !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    // ✅ Extract JWT token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("❌ Missing Authorization header");
      throw new Error("No authorization header");
    }

    // ✅ Validate JWT and extract user ID
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      console.error("❌ Invalid token:", userError);
      throw new Error("Invalid authentication token");
    }

    console.log("✅ Authenticated User ID:", user.id);

    // ✅ Fetch Twilio settings for the user
    const { data: settings, error: settingsError } = await supabaseClient
      .from("settings")
      .select("twilio_account_sid, twilio_auth_token, twilio_phone_number")
      .eq("user_id", user.id)
      .single();

    console.log("🛑 Supabase Query Result:", settings);
    console.log("🛑 Supabase Query Error:", settingsError);

    if (settingsError) {
      throw new Error(`Database error while fetching Twilio settings: ${settingsError.message}`);
    }

    if (!settings) {
      throw new Error("Twilio settings not found");
    }

    if (!settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_phone_number) {
      throw new Error("Incomplete Twilio settings");
    }

    return new Response(
      JSON.stringify({ success: true, settings }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error fetching Twilio settings:", error);
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
