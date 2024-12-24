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

    // Get user's Twilio settings with better error handling
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("twilio_account_sid, twilio_auth_token, twilio_phone_number")
      .single();

    if (settingsError) {
      console.error('Settings fetch error:', settingsError);
      throw new Error("Failed to fetch Twilio settings");
    }

    if (!settings?.twilio_account_sid || !settings?.twilio_auth_token || !settings?.twilio_phone_number) {
      throw new Error("Please configure your Twilio settings in the Settings page before making calls");
    }

    // Initialize Twilio client
    const client = twilio(
      settings.twilio_account_sid,
      settings.twilio_auth_token
    );

    // Create call using Twilio with better error handling
    try {
      const call = await client.calls.create({
        url: 'https://crm-six-black.vercel.app/api/calls/twiml',
        to,
        from,
        statusCallback: 'https://crm-six-black.vercel.app/api/calls/status',
        statusCallbackEvent: ['completed'],
      });

      // Update call record with Twilio SID
      const { error: updateError } = await supabase
        .from("calls")
        .update({ twilio_sid: call.sid })
        .eq("id", callId);

      if (updateError) {
        console.error('Call update error:', updateError);
        throw updateError;
      }

      return NextResponse.json({ success: true, sid: call.sid });
    } catch (twilioError) {
      console.error('Twilio call creation error:', twilioError);
      throw new Error(twilioError instanceof Error ? twilioError.message : "Failed to create Twilio call");
    }
  } catch (error) {
    console.error('Call creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}