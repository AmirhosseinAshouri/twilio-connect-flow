
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import Twilio JWT helper directly
import { jwt } from 'npm:twilio'
const { AccessToken } = jwt;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get authenticated user
    console.log('Getting authenticated user...')
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Auth error:', userError)
      throw new Error('Not authenticated')
    }

    // Get Twilio settings
    console.log('Fetching Twilio settings...')
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('twilio_account_sid, twilio_auth_token, twilio_twiml_app_sid')
      .eq('user_id', user.id)
      .maybeSingle()

    if (settingsError) {
      console.error('Settings error:', settingsError)
      throw new Error('Failed to fetch Twilio settings')
    }

    if (!settings?.twilio_account_sid || !settings?.twilio_auth_token || !settings?.twilio_twiml_app_sid) {
      throw new Error('Incomplete Twilio settings')
    }

    // Generate Twilio token
    console.log('Generating Twilio token...')
    const token = new AccessToken(
      settings.twilio_account_sid,
      settings.twilio_auth_token,
      settings.twilio_twiml_app_sid
    )

    token.identity = user.id

    const VoiceGrant = AccessToken.VoiceGrant
    const grant = new VoiceGrant({
      outgoingApplicationSid: settings.twilio_twiml_app_sid,
      incomingAllow: true,
    })

    token.addGrant(grant)

    console.log('Token generated successfully')

    // Return success response
    return new Response(
      JSON.stringify({ 
        token: token.toJwt(),
        message: 'Token generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in get-twilio-token:', error)
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
