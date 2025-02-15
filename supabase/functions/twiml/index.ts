
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import twilio from "https://esm.sh/twilio@4.19.0"

serve(async (req) => {
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
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    
    // Initial greeting
    response.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Hello! Please wait while we connect your call.');

    // Add a brief pause
    response.pause({ length: 1 });

    // Add dial instruction to enable two-way communication
    const dial = response.dial({
      callerId: req.url.searchParams.get('From') || '',
      timeout: 30,
      record: 'record-from-answer',
      answerOnBridge: true
    });
    
    // Add the number to dial
    dial.number(req.url.searchParams.get('To') || '');

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
