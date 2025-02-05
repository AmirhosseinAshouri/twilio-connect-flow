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

    // Get the user's settings with all required fields
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select(`
        twilio_account_sid,
        twilio_auth_token,
        twilio_phone_number,
        twilio_twiml_app_sid,
        twilio_api_key,
        twilio_api_secret
      `)
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError) {
      console.error('Settings fetch error:', settingsError);
      return NextResponse.json(
        { error: "Failed to fetch Twilio settings" },
        { status: 500 }
      );
    }

    if (!settings) {
      console.error('No Twilio settings found for user:', user.id);
      return NextResponse.json(
        { error: "Please configure your Twilio settings in the Settings page" },
        { status: 400 }
      );
    }

    // Validate all required Twilio settings
    const requiredSettings = [
      'twilio_account_sid',
      'twilio_auth_token',
      'twilio_phone_number',
      'twilio_twiml_app_sid'
    ];

    const missingSettings = requiredSettings.filter(setting => !settings[setting]);
    if (missingSettings.length > 0) {
      console.error('Missing Twilio settings:', missingSettings);
      return NextResponse.json(
        { error: `Please complete your Twilio settings: ${missingSettings.join(', ')}` },
        { status: 400 }
      );
    }

    // Initialize Twilio client
    const client = twilio(
      settings.twilio_account_sid,
      settings.twilio_auth_token
    );

    console.log('Creating call with Twilio...');

    // Create call using Twilio with TwiML App SID
    const call = await client.calls.create({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/twiml`,
      to,
      from: settings.twilio_phone_number,
      applicationSid: settings.twilio_twiml_app_sid,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/status`,
      statusCallbackEvent: ['completed'],
    });

    console.log('Call created:', call.sid);

    // Update call record with Twilio SID
    const { error: updateError } = await supabase
      .from('calls')
      .update({ 
        twilio_sid: call.sid,
        status: 'initiated'
      })
      .eq('id', callId)
      .eq('user_id', user.id);

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