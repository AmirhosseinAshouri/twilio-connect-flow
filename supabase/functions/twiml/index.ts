
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import twilio from "https://esm.sh/twilio@4.19.0"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      status: 204,
    })
  }

  try {
    const url = new URL(req.url);
    const to = url.searchParams.get('To');
    const from = url.searchParams.get('From');

    console.log('Generating TwiML for call:', { to, from });

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    
    // Add a greeting
    response.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Hello! Please wait while we connect your call.');

    // Add a brief pause
    response.pause({ length: 1 });

    // Add dial instruction to enable two-way communication
    const dial = response.dial({
      callerId: from || '',
      timeout: 30,
      record: 'record-from-answer',
      answerOnBridge: true
    });
    
    // Add the number to dial
    dial.number(to || '');

    console.log('Generated TwiML:', response.toString());

    return new Response(response.toString(), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('Error generating TwiML:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate TwiML response' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
