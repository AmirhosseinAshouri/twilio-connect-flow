import { supabase } from "@/integrations/supabase/client";
import twilio from "twilio";

export async function createCall(req: Request) {
  try {
    const { callId, to, from, notes } = await req.json();

    // Get user's Twilio settings
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!settings) throw new Error("Twilio settings not found");

    // Initialize Twilio client
    const client = twilio(
      settings.twilio_account_sid,
      settings.twilio_auth_token
    );

    // Create call using Twilio
    const call = await client.calls.create({
      url: `${process.env.VITE_APP_URL}/api/twiml`, // Your TwiML URL
      to,
      from,
      statusCallback: `${process.env.VITE_APP_URL}/api/calls/status/${callId}`,
      statusCallbackEvent: ['completed'],
    });

    // Update call record with Twilio SID
    await supabase
      .from("calls")
      .update({ twilio_sid: call.sid })
      .eq("id", callId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
} 