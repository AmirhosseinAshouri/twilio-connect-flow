import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1"

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Use service role key instead of anon key

// Create Supabase client with service role key for full access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to parse message data
function parseTwilioMessage(url: URL): Record<string, string> {
  const params = url.searchParams
  return {
    from: params.get('From') || '',
    body: params.get('Body') || '',
    messageSid: params.get('MessageSid') || '',
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const messageData = parseTwilioMessage(url)

    // Find the contact based on the phone number
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, user_id')
      .eq('phone', messageData.from)
      .maybeSingle()

    if (contactError) {
      throw contactError
    }

    if (!contact) {
      console.error('No contact found for phone number:', messageData.from)
      return new Response(
        JSON.stringify({ error: 'Contact not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Store the incoming message
    const { error: messageError } = await supabase
      .from('communications')
      .insert({
        contact_id: contact.id,
        user_id: contact.user_id,
        type: 'sms',
        direction: 'incoming',
        content: messageData.body,
        twilio_sid: messageData.messageSid,
        created_at: new Date().toISOString()
      })

    if (messageError) {
      throw messageError
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
