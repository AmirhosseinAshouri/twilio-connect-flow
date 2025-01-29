import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import twilio from "https://esm.sh/twilio@4.19.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
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

    const { callId, to, notes } = await req.json()
    console.log('Received request:', { callId, to, notes })

    // Get the user's Twilio settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('twilio_account_sid, twilio_auth_token, twilio_phone_number')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings) {
      console.error('Settings error:', settingsError)
      throw new Error('Failed to fetch Twilio settings')
    }

    if (!settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_phone_number) {
      throw new Error('Incomplete Twilio settings')
    }

    // Initialize Twilio client
    const client = twilio(
      settings.twilio_account_sid,
      settings.twilio_auth_token
    )

    console.log('Creating call with Twilio...', { to, from: settings.twilio_phone_number })

    // Create the call
    const call = await client.calls.create({
      url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/twiml`,
      to,
      from: settings.twilio_phone_number,
      statusCallback: `${Deno.env.get('SUPABASE_URL')}/functions/v1/call-status`,
      statusCallbackEvent: ['completed'],
    })

    console.log('Call created:', call.sid)

    // Update call record with Twilio SID
    const { error: updateError } = await supabaseClient
      .from('calls')
      .update({ 
        twilio_sid: call.sid,
        status: 'initiated'
      })
      .eq('id', callId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      throw new Error('Failed to update call record')
    }

    return new Response(
      JSON.stringify({ success: true, sid: call.sid }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating call:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})