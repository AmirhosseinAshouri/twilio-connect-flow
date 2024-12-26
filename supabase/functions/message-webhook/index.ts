import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1"

// Type definitions
interface TwilioMessage {
  From: string
  Body: string
  MessageSid: string
}

// Environment variable validation
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing required environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Helper function to parse message data from either GET or POST requests
async function parseTwilioMessage(req: Request): Promise<TwilioMessage> {
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const from = url.searchParams.get('From')
    const body = url.searchParams.get('Body')
    const messageSid = url.searchParams.get('MessageSid')

    if (!from || !body || !messageSid) {
      throw new Error('Missing required Twilio message fields in query parameters')
    }

    return {
      From: decodeURIComponent(from),
      Body: decodeURIComponent(body),
      MessageSid: messageSid
    }
  } else if (req.method === 'POST') {
    const formData = await req.formData()
    const from = formData.get('From')
    const body = formData.get('Body')
    const messageSid = formData.get('MessageSid')

    if (!from || !body || !messageSid) {
      throw new Error('Missing required Twilio message fields in form data')
    }

    return {
      From: from.toString(),
      Body: body.toString(),
      MessageSid: messageSid.toString()
    }
  }

  throw new Error('Unsupported request method')
}

// Helper function to create response
function createResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status
  })
}

serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse message data from either GET or POST request
    const { From, Body, MessageSid } = await parseTwilioMessage(req)

    // Find the contact based on the phone number
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, user_id')
      .eq('phone', From)
      .maybeSingle()

    if (contactError) {
      console.error('Error fetching contact:', contactError)
      throw new Error('Failed to fetch contact')
    }

    if (!contact) {
      console.error('No contact found for phone number:', From)
      return createResponse({ error: 'Contact not found' }, 404)
    }

    // Store the incoming message
    const { error: messageError } = await supabase
      .from('communications')
      .insert({
        contact_id: contact.id,
        user_id: contact.user_id,
        type: 'sms',
        direction: 'incoming',
        content: Body,
        twilio_sid: MessageSid,
        created_at: new Date().toISOString()
      })

    if (messageError) {
      console.error('Error storing message:', messageError)
      throw new Error('Failed to store message')
    }

    return createResponse({ 
      success: true,
      message: 'SMS message processed successfully',
      messageSid: MessageSid
    })

  } catch (error) {
    console.error('Error processing incoming message:', error)
    return createResponse({ 
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }, 500)
  }
})
