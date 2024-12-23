import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { callId, to, from, notes } = await request.json();

    // Get user's Twilio settings
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .single();

    if (settingsError || !settings) {
      throw new Error("Twilio settings not found");
    }

    // Initialize Twilio client
    const client = twilio(
      settings.twilio_account_sid,
      settings.twilio_auth_token
    );

    // Create call using Twilio
    const call = await client.calls.create({
      url: 'http://demo.twilio.com/docs/voice.xml', // Temporary TwiML URL
      to,
      from,
    });

    // Update call record with Twilio SID
    const { error: updateError } = await supabase
      .from("calls")
      .update({ twilio_sid: call.sid })
      .eq("id", callId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, sid: call.sid });
  } catch (error) {
    console.error('Call creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 