import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

// ✅ Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // Use service role key

// ✅ Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ✅ Function to parse and normalize Twilio message data
async function parseTwilioMessage(req: Request): Promise<Record<string, string>> {
  let from = "";
  let body = "";
  let messageSid = "";

  if (req.method === "GET") {
    // ✅ Extract from URL params (GET request)
    const url = new URL(req.url);
    from = url.searchParams.get("From") || "";
    body = url.searchParams.get("Body") || "";
    messageSid = url.searchParams.get("MessageSid") || "";
  } else if (req.method === "POST") {
    // ✅ Extract from form-data (POST request)
    const formData = await req.formData();
    from = formData.get("From")?.toString() || "";
    body = formData.get("Body")?.toString() || "";
    messageSid = formData.get("MessageSid")?.toString() || "";
  }

  return {
    from: from.replace(/\D/g, ""), // Normalize phone number (remove non-numeric characters)
    body,
    messageSid,
  };
}

serve(async (req) => {
  // ✅ Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const messageData = await parseTwilioMessage(req);

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

    // ✅ Query Supabase for matching contact (limit to 1)
    const { data: contacts, error: contactError } = await supabase
    .from("contacts")
    .select("id, user_id") // ✅ Fetch both `id` and `user_id`
    .or(`phone.eq.${incomingPhoneNumber}, phone.eq.+${incomingPhoneNumber}`)
    .limit(1);
  

    if (contactError) {
      console.error("🛑 Supabase Query Error:", contactError);
      throw contactError;
    }

    if (!contacts || contacts.length === 0) {
      console.warn(`⚠️ No contact found for: ${incomingPhoneNumber}`);
      return new Response(
        JSON.stringify({ warning: "No matching contact found. Storing as unknown sender." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200, // ✅ Prevents Twilio from retrying
        }
      );
    }

    const contact = contacts[0]; // ✅ Now we have exactly one contact

    // ✅ Store the incoming message in Supabase
    const { error: messageError } = await supabase.from("communications").insert({
      contact_id: contact.id,
      user_id: contact.user_id, // ✅ Ensure `user_id` is included
      type: "sms",
      direction: "received",
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
