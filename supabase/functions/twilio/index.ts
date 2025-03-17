
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
    console.log(`Processing ${action} request`, toNumber ? { toNumber } : '');

    switch (action) {
      case 'getToken':
        // Import access token classes from Twilio helper library
        const { jwt: { AccessToken } } = Twilio;
        const VoiceGrant = AccessToken.VoiceGrant;

        // Create an access token with the proper identity
        const token = new AccessToken(
          Deno.env.get('TWILIO_ACCOUNT_SID') || '',
          Deno.env.get('TWILIO_API_KEY') || '',
          Deno.env.get('TWILIO_API_SECRET') || '',
          { identity: 'browser-user' } // Set a consistent identity
        );

        // Create a Voice grant and add it to the token
        const voiceGrant = new VoiceGrant({
          outgoingApplicationSid: Deno.env.get('TWILIO_TWIML_APP_SID'),
          incomingAllow: true,
        });

        token.addGrant(voiceGrant);
        console.log('Generated token successfully');

        return new Response(
          JSON.stringify({ token: token.toJwt() }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'getCapabilityToken':
        // For legacy Twilio Client SDK if needed
        const client = new Twilio(
          Deno.env.get('TWILIO_ACCOUNT_SID') || '',
          Deno.env.get('TWILIO_AUTH_TOKEN') || ''
        );
        
        const capability = new Twilio.jwt.ClientCapability({
          accountSid: Deno.env.get('TWILIO_ACCOUNT_SID') || '',
          authToken: Deno.env.get('TWILIO_AUTH_TOKEN') || ''
        });
        
        capability.addScope(new Twilio.jwt.ClientCapability.OutgoingClientScope({
          applicationSid: Deno.env.get('TWILIO_TWIML_APP_SID') || '',
          clientName: 'browser-user'
        }));
        
        return new Response(
          JSON.stringify({ token: capability.toJwt() }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'makeCall':
        if (!toNumber) {
          throw new Error('Phone number is required');
        }

        const twilioClient = new Twilio(
          Deno.env.get('TWILIO_ACCOUNT_SID') || '',
          Deno.env.get('TWILIO_AUTH_TOKEN') || ''
        );

        console.log(`Making call from ${Deno.env.get('TWILIO_PHONE_NUMBER')} to ${toNumber}`);
        
        // Create call using Twilio REST API (this creates a call from Twilio to the specified number)
        const call = await twilioClient.calls.create({
          url: `${Deno.env.get('PUBLIC_URL')}/api/twilio/voice`,
          to: toNumber,
          from: Deno.env.get('TWILIO_PHONE_NUMBER'),
        });

        console.log(`Call created with SID: ${call.sid}`);
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
