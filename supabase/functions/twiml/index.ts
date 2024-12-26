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
    const CallSid = formData.get('CallSid') as string

    // Find the contact based on the phone number
    const { data: contacts, error: contactError } = await supabase
      .from('contacts')
      .select('id, user_id')
      .eq('phone', From)
      .maybeSingle()

    if (contactError) {
      throw contactError
    }

    if (contacts) {
      // Log the incoming call
      await supabase
        .from('calls')
        .insert({
          contact_id: contacts.id,
          user_id: contacts.user_id,
          status: 'incoming',
          notes: 'Incoming call',
          twilio_sid: CallSid
        })
    }

    // Generate TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>Thank you for calling. Please leave a message after the tone.</Say>
    <Record maxLength="30" playBeep="true" />
</Response>`

    return new Response(twiml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('Error handling incoming call:', error)
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>We're sorry, but there was an error processing your call. Please try again later.</Say>
</Response>`

    return new Response(errorTwiml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    })
  }
})