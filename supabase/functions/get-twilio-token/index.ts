import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AccessToken } from 'https://esm.sh/twilio@4.19.0/lib/jwt/AccessToken'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the JWT token from the request header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get the user from the JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid token')
    }

    console.log('Fetching Twilio settings for user:', user.id)

    // Get the user's Twilio settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('twilio_account_sid, twilio_auth_token')
      .eq('user_id', user.id)
      .single()

    if (settingsError) {
      console.error('Settings fetch error:', settingsError)
      throw new Error('Failed to fetch Twilio settings')
    }

    if (!settings?.twilio_account_sid || !settings?.twilio_auth_token) {
      console.error('Incomplete Twilio settings:', {
        hasTwilioAccountSid: !!settings?.twilio_account_sid,
        hasTwilioAuthToken: !!settings?.twilio_auth_token
      })
      
      return new Response(
        JSON.stringify({
          error: 'Incomplete Twilio settings',
          details: {
            hasTwilioAccountSid: !!settings?.twilio_account_sid,
            hasTwilioAuthToken: !!settings?.twilio_auth_token
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log('Creating Twilio access token')

    // Create an access token
    const accessToken = new AccessToken(
      settings.twilio_account_sid,
      settings.twilio_auth_token,
      { identity: user.id }
    )

    // Create a Voice grant and add it to the token
    const VoiceGrant = AccessToken.VoiceGrant
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: settings.twilio_account_sid,
      incomingAllow: true,
    })
    accessToken.addGrant(voiceGrant)

    // Generate the token
    const token = accessToken.toJwt()

    console.log('Token generated successfully')

    return new Response(
      JSON.stringify({ token }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Token generation error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})