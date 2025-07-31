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
    console.log('=== TWILIO TEST FUNCTION START ===')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the JWT token from the request header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Authentication failed')
    }

    console.log('User authenticated:', user.id)

    // Get user's Twilio settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('twilio_account_sid, twilio_auth_token, twilio_phone_number')
      .eq('user_id', user.id)
      .maybeSingle()

    if (settingsError || !settings) {
      throw new Error('Twilio settings not found')
    }

    console.log('Settings found:', {
      accountSid: settings.twilio_account_sid,
      phoneNumber: settings.twilio_phone_number,
      hasAuthToken: !!settings.twilio_auth_token
    })

    // Test Twilio API connection
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${settings.twilio_account_sid}.json`
    const basicAuth = btoa(`${settings.twilio_account_sid}:${settings.twilio_auth_token}`)

    console.log('Testing Twilio API connection...')
    const twilioTestResponse = await fetch(twilioUrl, {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
      },
    })

    const twilioTestResult = await twilioTestResponse.text()
    console.log('Twilio API test result:', twilioTestResponse.status, twilioTestResult)

    if (!twilioTestResponse.ok) {
      throw new Error(`Twilio API test failed: ${twilioTestResult}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Twilio configuration is working correctly',
        twilioStatus: twilioTestResponse.status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('=== TWILIO TEST ERROR ===')
    console.error('Error details:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})