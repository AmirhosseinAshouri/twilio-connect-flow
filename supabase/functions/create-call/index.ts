
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log('=== CREATE CALL FUNCTION START ===')
    
    // Use service role key for better permissions
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the JWT token from the request header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header')
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('JWT token received, length:', token.length)

    // Get the user from the JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      console.error('Authentication failed:', userError)
      throw new Error('Authentication failed')
    }

    console.log('User authenticated successfully:', user.id)

    const { callId, to, notes } = await req.json()
    console.log('Request data:', { callId, to, notes })

    // Validate required fields
    if (!callId || !to) {
      console.error('Missing required fields:', { callId, to })
      throw new Error('Missing required fields: callId and to')
    }

    // Get the user's Twilio settings
    console.log('Fetching Twilio settings for user:', user.id)
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('twilio_account_sid, twilio_auth_token, twilio_phone_number')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('Settings query result:', { 
      hasSettings: !!settings, 
      settingsError,
      accountSid: settings?.twilio_account_sid ? 'present' : 'missing',
      authToken: settings?.twilio_auth_token ? 'present' : 'missing',
      phoneNumber: settings?.twilio_phone_number ? 'present' : 'missing'
    })

    if (settingsError) {
      console.error('Database error fetching settings:', settingsError)
      throw new Error('Failed to fetch Twilio settings')
    }

    if (!settings) {
      console.log('No settings found for user:', user.id)
      throw new Error('Please configure your Twilio settings in the Settings page')
    }

    if (!settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_phone_number) {
      console.error('Incomplete Twilio settings for user:', user.id)
      throw new Error('Please complete your Twilio settings configuration')
    }

    // Create TwiML URL - simplified without query params
    const twimlUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/twiml`
    const statusCallbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/call-status`

    console.log('Making Twilio API call...', {
      from: settings.twilio_phone_number,
      to: to,
      twimlUrl,
      statusCallbackUrl
    })

    // Make request to Twilio API directly
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${settings.twilio_account_sid}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${settings.twilio_account_sid}:${settings.twilio_auth_token}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: settings.twilio_phone_number,
          Url: twimlUrl,
          StatusCallback: statusCallbackUrl,
          StatusCallbackEvent: 'initiated,ringing,answered,completed',
        }).toString(),
      }
    )

    console.log('Twilio API response status:', twilioResponse.status)
    const twilioResponseText = await twilioResponse.text()
    console.log('Twilio API response:', twilioResponseText)

    if (!twilioResponse.ok) {
      console.error('Twilio API call failed:', twilioResponse.status, twilioResponseText)
      throw new Error(`Twilio API error: ${twilioResponseText}`)
    }

    // Parse response - Twilio returns JSON for API calls
    let twilioData
    try {
      twilioData = JSON.parse(twilioResponseText)
    } catch (parseError) {
      console.error('Failed to parse Twilio response as JSON:', parseError)
      throw new Error('Invalid response from Twilio API')
    }

    console.log('Twilio call created successfully:', twilioData.sid)

    // Update call record with Twilio SID
    const { error: updateError } = await supabaseClient
      .from('calls')
      .update({ 
        twilio_sid: twilioData.sid,
        status: 'initiated',
        start_time: new Date().toISOString()
      })
      .eq('id', callId)

    if (updateError) {
      console.error('Failed to update call record:', updateError)
      // Don't fail the entire request as the call was initiated successfully
    }

    console.log('=== CREATE CALL FUNCTION SUCCESS ===')
    return new Response(
      JSON.stringify({ 
        success: true, 
        callId: callId,
        sid: twilioData.sid,
        message: 'Call initiated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('=== CREATE CALL FUNCTION ERROR ===')
    console.error('Error details:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
