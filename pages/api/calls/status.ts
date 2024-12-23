import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { CallSid, CallDuration, CallStatus } = req.body;

    // Update the call record in the database
    const { error } = await supabase
      .from('calls')
      .update({
        duration: parseInt(CallDuration) || 0,
        status: CallStatus,
      })
      .eq('twilio_sid', CallSid);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Status callback error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
} 