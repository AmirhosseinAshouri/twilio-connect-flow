import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { callId, to, notes } = await request.json();
    console.log('Received call request:', { callId, to, notes });

    // Get user's Twilio settings from the request headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return NextResponse.json(
        { error: "No authorization header" },
        { status: 401 }
      );
    }

    // Verify the session
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User authentication error:', userError);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log('Authenticated user:', user.id);

    // Get the user's settings
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("twilio_account_sid, twilio_auth_token, twilio_phone_number")
      .eq("user_id", user.id)
      .single();

    if (settingsError || !settings) {
      console.error('Settings fetch error:', settingsError);
      return NextResponse.json(
        { error: "Twilio settings not found" },
        { status: 400 }
      );
    }

    if (!settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_phone_number) {
      console.error('Missing Twilio settings for user:', user.id);
      return NextResponse.json(
        { error: "Please configure your Twilio settings in the Settings page" },
        { status: 400 }
      );
    }

    // Initialize Twilio client
    const client = twilio(
      settings.twilio_account_sid,
      settings.twilio_auth_token
    );

    console.log('Initializing call with Twilio...');

    // Create call using Twilio
    const call = await client.calls.create({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/twiml`,
      to,
      from: settings.twilio_phone_number,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/status`,
      statusCallbackEvent: ['completed'],
    });

    console.log('Call created with Twilio:', call.sid);

    // Update call record with Twilio SID
    const { error: updateError } = await supabase
      .from("calls")
      .update({ twilio_sid: call.sid })
      .eq("id", callId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error('Error updating call record:', updateError);
      return NextResponse.json(
        { error: "Failed to update call record" },
        { status: 500 }
      );
    }

    console.log('Call record updated successfully');

    return NextResponse.json({ success: true, sid: call.sid });
  } catch (error) {
    console.error('Call creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create call" },
      { status: 500 }
    );
  }
}