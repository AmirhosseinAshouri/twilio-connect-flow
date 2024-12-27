import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import twilio from "https://esm.sh/twilio@4.19.0"

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
    const { callId, to, notes } = await req.json()
    console.log('Received request:', { callId, to, notes })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      console.error('User fetch error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Authenticated user:', user.id)

    // Get user's Twilio settings using maybeSingle() instead of single()
    const { data: settings, error: settingsError } = await supabaseClient
      .from("settings")
      .select("twilio_account_sid, twilio_auth_token, twilio_phone_number")
      .eq("user_id", user.id)
      .maybeSingle()

    if (settingsError) {
      console.error('Settings fetch error:', settingsError)
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch Twilio settings",
          details: settingsError.message 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!settings) {
      console.error('No settings found for user:', user.id)
      return new Response(
        JSON.stringify({ 
          error: "Please configure your Twilio settings in the Settings page first",
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_phone_number) {
      console.error('Incomplete Twilio settings for user:', user.id)
      return new Response(
        JSON.stringify({ 
          error: "Please configure your Twilio settings in the Settings page first",
          missingSettings: true 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Retrieved Twilio settings for user:', user.id)

    // Initialize Twilio client
    const client = twilio(
      settings.twilio_account_sid,
      settings.twilio_auth_token
    )

    const baseUrl = `${req.url.split('/functions/')[0]}/functions/v1`

    // Create call using Twilio
    console.log('Creating Twilio call with settings:', {
      url: `${baseUrl}/twiml`,
      to,
      from: settings.twilio_phone_number,
      statusCallback: `${baseUrl}/call-status`
    })

    const call = await client.calls.create({
      url: `${baseUrl}/twiml`,
      to,
      from: settings.twilio_phone_number,
      statusCallback: `${baseUrl}/call-status`,
      statusCallbackEvent: ['completed'],
    })

    console.log('Call created successfully:', call.sid)

    // Update call record with Twilio SID
    if (callId) {
      const { error: updateError } = await supabaseClient
        .from("calls")
        .update({ 
          twilio_sid: call.sid,
          status: 'initiated'
        })
        .eq("id", callId)
        .eq("user_id", user.id)  // Ensure we only update the user's own call

      if (updateError) {
        console.error('Call update error:', updateError)
        // Don't throw here, as the call was created successfully
        console.warn('Failed to update call record, but call was created')
      }
    }

    return new Response(
      JSON.stringify({ success: true, sid: call.sid }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-call function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
})