
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      status: 204,
    })
  }

  try {
    const formData = await req.formData()
    const CallSid = formData.get('CallSid')
    const CallDuration = formData.get('CallDuration')
    const CallStatus = formData.get('CallStatus')

    console.log('Received status update:', { CallSid, CallDuration, CallStatus })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { error } = await supabaseClient
      .from('calls')
      .update({
        duration: parseInt(CallDuration?.toString() || '0'),
        status: CallStatus?.toString(),
      })
      .eq('twilio_sid', CallSid)

    if (error) {
      console.error('Error updating call status:', error)
      throw error
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in call-status function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
