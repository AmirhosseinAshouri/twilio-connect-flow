import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received Call Request:", body);

    const { callId, to, notes } = body;

    // Check Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized - Missing Token" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: user, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.log("Supabase Auth Error:", userError);
      return NextResponse.json({ error: "Unauthorized - Invalid Token" }, { status: 401 });
    }

    console.log("User Authenticated:", user);

    // Fetch Twilio Settings from Supabase
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("twilio_account_sid, twilio_auth_token, twilio_phone_number")
      .eq("user_id", user.id)
      .single();

    console.log("Fetched Twilio Settings:", settings);
    if (!settings || settingsError) {
      return NextResponse.json({ error: "Twilio settings not found in database" }, { status: 500 });
    }

    // Initialize Twilio Client
    const client = twilio(settings.twilio_account_sid, settings.twilio_auth_token);

    // Create Twilio Call
    const call = await client.calls.create({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/twiml`,
      to,
      from: settings.twilio_phone_number,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/status`,
      statusCallbackEvent: ["completed"],
    });

    console.log("Twilio Call Created:", call);

    // Update Call Status in Supabase
    await supabase.from("calls").update({ twilio_sid: call.sid, status: "initiated" }).eq("id", callId);

    return NextResponse.json({ success: true, sid: call.sid });
  } catch (error) {
    console.error("Twilio Call Creation Error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create call" }, { status: 500 });
  }
}
