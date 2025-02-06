import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.text();
  console.log("Twilio Status Update Received:", body);

  return NextResponse.json({ success: true });
}
