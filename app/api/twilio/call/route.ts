import { NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: Request) {
  const { to, from } = await req.json();

  if (!to || !from) {
    return NextResponse.json({ error: "Missing 'to' or 'from' number" }, { status: 400 });
  }

  const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

  const call = await client.calls.create({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice`,
    to,
    from,
  });

  return NextResponse.json({ success: true, callSid: call.sid });
}
