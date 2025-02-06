import { NextResponse } from "next/server";
import { twiml } from "twilio";

export async function GET() {
  const response = new twiml.VoiceResponse();
  response.say("Welcome to the CRM system call.");
  response.pause({ length: 1 });
  response.play("http://com.twilio.music.classical.s3.amazonaws.com/BusyStrings.mp3");
  response.say("Connecting you now. Please wait.");

  return new Response(response.toString(), { headers: { "Content-Type": "text/xml" } });
}
