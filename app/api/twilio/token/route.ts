
import { NextResponse } from "next/server";
import twilio from "twilio";
import { supabase } from "@/integrations/supabase/client";

export async function GET(req: Request) {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(
      settings.twilio_account_sid,
      settings.twilio_auth_token,
      settings.twilio_twiml_app_sid,
      { identity: session.user.id }
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: settings.twilio_twiml_app_sid,
      incomingAllow: true,
    });

    token.addGrant(voiceGrant);

    return NextResponse.json({ token: token.toJwt() });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate token" },
      { status: 500 }
    );
  }
}
