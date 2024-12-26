import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const From = formData.get('From') as string
    const Body = formData.get('Body') as string
    const MessageSid = formData.get('MessageSid') as string

    // Find the contact based on the phone number
    const { data: contacts, error: contactError } = await supabase
      .from('contacts')
      .select('id, user_id')
      .eq('phone', From)
      .maybeSingle()

    if (contactError) {
      throw contactError
    }

    if (!contacts) {
      console.error('No contact found for phone number:', From)
      return new Response(JSON.stringify({ error: 'Contact not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }

    // Store the incoming message
    const { error: messageError } = await supabase
      .from('communications')
      .insert({
        contact_id: contacts.id,
        user_id: contacts.user_id,
        type: 'sms',
        direction: 'incoming',
        content: Body,
        twilio_sid: MessageSid
      })

    if (messageError) {
      throw messageError
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error processing incoming message:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})