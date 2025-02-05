import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { createClient } from '@supabase/supabase-js';
import { validateTwilioSettings } from '@/utils/twilioUtils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { callId, to, notes } = await request.json();
    console.log('Received call request:', { callId, to, notes });

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return NextResponse.json(
        { error: "No authorization header" },
        { status: 401 }
      );
    }

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

    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select(`
        twilio_account_sid,
        twilio_auth_token,
        twilio_phone_number,
        twilio_twiml_app_sid
      `)
      .eq('user_id', user.id)
      .single();

    if (settingsError) {
      console.error('Settings fetch error:', settingsError);
      return NextResponse.json(
        { error: "Failed to fetch Twilio settings" },
        { status: 500 }
      );
    }

    const validation = validateTwilioSettings(settings);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const client = twilio(
      settings.twilio_account_sid,
      settings.twilio_auth_token
    );

    console.log('Creating call with Twilio...');

    const call = await client.calls.create({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/twiml`,
      to,
      from: settings.twilio_phone_number,
      applicationSid: settings.twilio_twiml_app_sid,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/status`,
      statusCallbackEvent: ['completed'],
    });

    console.log('Call created:', call.sid);

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