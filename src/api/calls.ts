import { supabase } from "@/integrations/supabase/client";
import twilio from "twilio";

export async function createCall(req: Request) {
  try {
    const { callId, to, from, notes } = await req.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // First check if settings exist
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      throw new Error("Failed to fetch Twilio settings");
    }

    if (!settings || !settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_phone_number) {
      throw new Error("Please configure your Twilio settings in the Settings page before making calls");
    }

    const client = twilio(
      settings.twilio_account_sid,
      settings.twilio_auth_token
    );

    const call = await client.calls.create({
      url: `${process.env.VITE_APP_URL}/api/twiml`,
      to,
      from,
      statusCallback: `${process.env.VITE_APP_URL}/api/calls/status/${callId}`,
      statusCallbackEvent: ['completed'],
    });

    await supabase
      .from("calls")
      .update({ 
        twilio_sid: call.sid,
        status: 'initiated'
      })
      .eq("id", callId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Call creation error:', error);
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