
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AccessToken } from 'https://esm.sh/twilio@4.19.0/lib/jwt/AccessToken.js'
import { VoiceGrant } from 'https://esm.sh/twilio@4.19.0/lib/jwt/AccessToken.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('twilio_account_sid, twilio_auth_token, twilio_twiml_app_sid')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings) {
      throw new Error('Failed to fetch Twilio settings')
    }

    if (!settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_twiml_app_sid) {
      throw new Error('Incomplete Twilio settings')
    }

    console.log('Creating Twilio Access Token...')

    const token = new AccessToken(
      settings.twilio_account_sid,
      settings.twilio_auth_token,
      settings.twilio_twiml_app_sid
    )
    
    token.identity = user.id

    const grant = new VoiceGrant({
      outgoingApplicationSid: settings.twilio_twiml_app_sid,
      incomingAllow: true,
    })

    token.addGrant(grant)

    console.log('Token generated successfully')

    return new Response(
      JSON.stringify({ token: token.toJwt() }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error generating token:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
