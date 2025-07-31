
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
      },
      status: 204,
    })
  }

  try {
    console.log('=== CALL STATUS WEBHOOK START ===')
    
    // Use service role key for better permissions
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse Twilio webhook data - handle both form data and JSON
    let webhookData: any = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData()
      webhookData = {
        CallSid: formData.get('CallSid'),
        CallDuration: formData.get('CallDuration'),
        CallStatus: formData.get('CallStatus'),
        From: formData.get('From'),
        To: formData.get('To')
      }
    } else if (contentType.includes("application/json")) {
      webhookData = await req.json();
    }

    const { CallSid, CallDuration, CallStatus, From, To } = webhookData;
    console.log('Received status update:', { CallSid, CallDuration, CallStatus, From, To })

    if (!CallSid) {
      console.error('No CallSid in webhook data')
      return new Response('Missing CallSid', { status: 400, headers: corsHeaders })
    }

    // Map Twilio statuses to our statuses
    const statusMap: { [key: string]: string } = {
      'initiated': 'initiated',
      'ringing': 'ringing',
      'in-progress': 'in-progress', 
      'answered': 'in-progress',
      'completed': 'completed',
      'busy': 'busy',
      'failed': 'failed',
      'no-answer': 'no-answer',
      'canceled': 'canceled'
    }

    const mappedStatus = statusMap[CallStatus] || CallStatus;
    console.log(`Updating call status: ${CallStatus} -> ${mappedStatus}`)

    // Prepare update data
    const updateData: any = {
      status: mappedStatus
    }

    // Add duration and end time if call is completed
    if (CallStatus === 'completed' && CallDuration) {
      updateData.duration = parseInt(CallDuration.toString());
      updateData.end_time = new Date().toISOString();
    }

    // Add start time if call is answered/in-progress
    if (CallStatus === 'answered' || CallStatus === 'in-progress') {
      updateData.start_time = new Date().toISOString();
    }

    const { error } = await supabaseClient
      .from('calls')
      .update(updateData)
      .eq('twilio_sid', CallSid)

    if (error) {
      console.error('Error updating call status:', error)
      return new Response('Database update failed', { status: 500, headers: corsHeaders })
    }

    console.log('Call status updated successfully')
    return new Response('OK', { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error('=== CALL STATUS WEBHOOK ERROR ===')
    console.error('Error details:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
