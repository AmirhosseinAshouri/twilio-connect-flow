import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // Use service role key

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ✅ Function to parse and normalize Twilio message data
function parseTwilioMessage(url: URL): Record<string, string> {
  const params = url.searchParams;
  return {
    from: params.get("From")?.replace(/\D/g, ""), // Normalize phone number (remove non-numeric characters)
    body: params.get("Body") || "",
    messageSid: params.get("MessageSid") || "",
  };
}

serve(async (req) => {
  // ✅ Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const messageData = parseTwilioMessage(url);

    console.log("📩 Incoming message from:", messageData.from);

    // ✅ Query only the phone number (No `user_id` selection)
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("id") // Only select the `id`, no `user_id`
      .or(`phone.eq.${messageData.from}, phone.eq.+${messageData.from}`)
      .maybeSingle();

    if (contactError) {
      throw contactError;
    }

    if (!contact) {
      console.warn(`⚠️ No contact found for phone number: ${messageData.from}`);
      return new Response(
        JSON.stringify({ warning: "No matching contact found. Storing as unknown sender." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200, // ✅ Prevents Twilio from retrying
        }
      );
    }

    // ✅ Store the incoming message in Supabase
    const { error: messageError } = await supabase.from("communications").insert({
      contact_id: contact.id,
      type: "sms",
      direction: "incoming",
      content: messageData.body,
      twilio_sid: messageData.messageSid,
      created_at: new Date().toISOString(),
    });

    if (messageError) {
      throw messageError;
    }

    console.log("✅ Message stored successfully for contact:", contact.id);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error processing Twilio webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
