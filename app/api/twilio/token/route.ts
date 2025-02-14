
import { NextResponse } from "next/server";
import twilio from "twilio";
import { supabase } from "@/integrations/supabase/client";

export async function GET(req: Request) {
  try {
    // Get the session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching Twilio settings for user:", session.user.id);

    // Get user's Twilio settings from Supabase
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("twilio_account_sid, twilio_auth_token, twilio_twiml_app_sid")
      .eq("user_id", session.user.id)
      .single();

    if (settingsError || !settings) {
      console.error("Settings fetch error:", settingsError);
      return NextResponse.json({ error: "Failed to fetch Twilio settings" }, { status: 500 });
    }

    if (!settings.twilio_account_sid || !settings.twilio_auth_token) {
      return NextResponse.json({ error: "Incomplete Twilio settings" }, { status: 400 });
    }

    console.log("Generating Twilio token...");

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    // Create an access token
    const token = new AccessToken(
      settings.twilio_account_sid,
      settings.twilio_auth_token,
      settings.twilio_twiml_app_sid || settings.twilio_account_sid, // fallback to account SID if no TwiML app SID
      { identity: session.user.id }
    );

    // Create a Voice grant and add it to the token
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: settings.twilio_twiml_app_sid || settings.twilio_account_sid,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);

    console.log("Token generated successfully");

    return NextResponse.json({ token: token.toJwt() });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate token" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
