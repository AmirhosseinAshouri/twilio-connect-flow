import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    
    // Extract Twilio webhook data
    const recordingSid = formData.get('RecordingSid');
    const recordingUrl = formData.get('RecordingUrl');
    const callSid = formData.get('CallSid');
    const recordingStatus = formData.get('RecordingStatus');
    const recordingDuration = formData.get('RecordingDuration');

    console.log('Recording status webhook:', {
      recordingSid,
      recordingUrl,
      callSid,
      recordingStatus,
      recordingDuration
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (recordingStatus === 'completed' && recordingUrl) {
      // Store recording information in database
      const { error } = await supabase
        .from('call_recordings')
        .upsert({
          recording_sid: recordingSid,
          call_sid: callSid,
          recording_url: recordingUrl,
          duration: parseInt(recordingDuration?.toString() || '0'),
          status: recordingStatus,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing recording data:', error);
        throw error;
      }

      // Update the call record
      await supabase
        .from('calls')
        .update({ 
          recording_url: recordingUrl,
          recording_sid: recordingSid 
        })
        .eq('twilio_sid', callSid);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Recording status webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});