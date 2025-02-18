import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

// ✅ Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // Service role key for full access

// ✅ Create Supabase client
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
    from: params.get("From")?.replace(/\D/g, ""), // Remove all non-numeric characters
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

    if (!messageData.from) {
      console.error("❌ Error: No phone number found in the request!");
      return new Response(
        JSON.stringify({ error: "No phone number provided" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400, // Bad request
        }
      );
    }

    // ✅ Normalize the phone number for query
    const incomingPhoneNumber = messageData.from.replace(/\D/g, ""); // Remove all non-numeric characters
    console.log("📞 Normalized incoming number:", incomingPhoneNumber);

    // ✅ Query Supabase for matching contact
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("id") // Only select the `id`
      .or(`phone.eq.${incomingPhoneNumber}, phone.eq.+${incomingPhoneNumber}`)
      .maybeSingle();

    if (contactError) {
      console.error("🛑 Supabase Query Error:", contactError);
      throw contactError;
    }

    if (!contact) {
      console.warn(`⚠️ No contact found for: ${incomingPhoneNumber}`);
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
