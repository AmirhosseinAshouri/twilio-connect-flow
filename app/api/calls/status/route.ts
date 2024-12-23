import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid');
    const duration = formData.get('CallDuration');
    const status = formData.get('CallStatus');

    // Update the call record in the database
    const { error } = await supabase
      .from('calls')
      .update({
        duration: parseInt(duration as string) || 0,
        status: status as string,
      })
      .eq('twilio_sid', callSid);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Status callback error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 