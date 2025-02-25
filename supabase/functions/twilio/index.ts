
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Twilio } from "https://esm.sh/twilio@4.19.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, toNumber } = await req.json()

    switch (action) {
      case 'getToken':
        // Import access token classes from Twilio helper library
        const { jwt: { AccessToken } } = Twilio;
        const VoiceGrant = AccessToken.VoiceGrant;

        // Create an access token
        const token = new AccessToken(
          Deno.env.get('TWILIO_ACCOUNT_SID') || '',
          Deno.env.get('TWILIO_API_KEY') || '',
          Deno.env.get('TWILIO_API_SECRET') || '',
          { identity: 'user-current' }
        );

        // Create a Voice grant and add it to the token
        const voiceGrant = new VoiceGrant({
          outgoingApplicationSid: Deno.env.get('TWILIO_TWIML_APP_SID'),
          incomingAllow: true,
        });

        token.addGrant(voiceGrant);

        return new Response(
          JSON.stringify({ token: token.toJwt() }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'makeCall':
        if (!toNumber) {
          throw new Error('Phone number is required');
        }

        const client = new Twilio(
          Deno.env.get('TWILIO_ACCOUNT_SID') || '',
          Deno.env.get('TWILIO_AUTH_TOKEN') || ''
        );

        const call = await client.calls.create({
          url: `${Deno.env.get('PUBLIC_URL')}/api/twilio/voice`,
          to: toNumber,
          from: Deno.env.get('TWILIO_PHONE_NUMBER'),
        });

        return new Response(
          JSON.stringify({ callSid: call.sid }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
