import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { callId, to, from } = await request.json();

    // Get user's Twilio settings from the request headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: "No authorization header" },
        { status: 401 }
      );
    }

    // Get the user's settings
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("twilio_account_sid, twilio_auth_token")
      .single();

    if (settingsError || !settings?.twilio_account_sid || !settings?.twilio_auth_token) {
      console.error('Settings error:', settingsError);
      return NextResponse.json(
        { error: "Twilio settings not found" },
        { status: 400 }
      );
    }

    // Initialize Twilio client
    const client = twilio(
      settings.twilio_account_sid,
      settings.twilio_auth_token
    );

    // Create call using Twilio
    const call = await client.calls.create({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/twiml`,
      to,
      from,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/status`,
      statusCallbackEvent: ['completed'],
    });

    // Update call record with Twilio SID
    const { error: updateError } = await supabase
      .from("calls")
      .update({ twilio_sid: call.sid })
      .eq("id", callId);

    if (updateError) {
      console.error('Error updating call record:', updateError);
      return NextResponse.json(
        { error: "Failed to update call record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, sid: call.sid });
  } catch (error) {
    console.error('Call creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create call" },
      { status: 500 }
    );
  }
}