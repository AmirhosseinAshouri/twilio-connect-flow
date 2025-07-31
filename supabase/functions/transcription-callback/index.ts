import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    
    // Extract Twilio transcription webhook data
    const transcriptionSid = formData.get('TranscriptionSid');
    const transcriptionText = formData.get('TranscriptionText');
    const transcriptionStatus = formData.get('TranscriptionStatus');
    const transcriptionUrl = formData.get('TranscriptionUrl');
    const callSid = formData.get('CallSid');
    const recordingSid = formData.get('RecordingSid');

    console.log('Transcription callback:', {
      transcriptionSid,
      transcriptionStatus,
      callSid,
      recordingSid,
      textLength: transcriptionText?.length || 0
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (transcriptionStatus === 'completed' && transcriptionText) {
      // Store transcription in database
      const { error } = await supabase
        .from('call_transcriptions')
        .upsert({
          transcription_sid: transcriptionSid,
          call_sid: callSid,
          recording_sid: recordingSid,
          transcription_text: transcriptionText,
          transcription_url: transcriptionUrl,
          status: transcriptionStatus,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing transcription:', error);
        throw error;
      }

      // Update the call record with transcription
      await supabase
        .from('calls')
        .update({ 
          transcription_text: transcriptionText,
          transcription_sid: transcriptionSid 
        })
        .eq('twilio_sid', callSid);

      console.log('Transcription stored successfully');
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Transcription callback error:', error);
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