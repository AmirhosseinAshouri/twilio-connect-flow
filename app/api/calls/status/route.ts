import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const callSid = data.get('CallSid');
    const callStatus = data.get('CallStatus');
    const duration = data.get('CallDuration');

    if (!callSid) {
      return NextResponse.json(
        { error: "CallSid is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('calls')
      .update({
        status: callStatus,
        duration: duration ? parseInt(duration.toString()) : null
      })
      .eq('twilio_sid', callSid);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating call status:', error);
    return NextResponse.json(
      { error: "Failed to update call status" },
      { status: 500 }
    );
  }
}