import { NextResponse } from "next/server";
import twilio from "twilio";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const identity = searchParams.get("identity"); // User's name or ID

  if (!identity) {
    return NextResponse.json({ error: "Missing identity" }, { status: 400 });
  }

  const AccessToken = twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_API_KEY!,
    process.env.TWILIO_API_SECRET!,
    { identity }
  );

  token.addGrant(new VoiceGrant({ outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID!, incomingAllow: true }));

  return NextResponse.json({ token: token.toJwt() });
}
