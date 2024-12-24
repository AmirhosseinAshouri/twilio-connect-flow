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
      return NextResponse.json(
        { error: "Failed to fetch Twilio settings" },
        { status: 500 }
      );
    }

    if (!settings?.twilio_account_sid || !settings?.twilio_auth_token || !settings?.twilio_phone_number) {
      return NextResponse.json(
        { error: "Please configure your Twilio settings in the Settings page before making calls" },
        { status: 400 }
      );
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
        from: settings.twilio_phone_number,
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
        return NextResponse.json(
          { error: "Failed to update call record" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, sid: call.sid });
    } catch (twilioError) {
      console.error('Twilio call creation error:', twilioError);
      return NextResponse.json(
        { error: twilioError instanceof Error ? twilioError.message : "Failed to create Twilio call" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Call creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}