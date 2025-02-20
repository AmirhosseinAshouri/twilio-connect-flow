
import { NextResponse } from "next/server";
import { twiml } from "twilio";

export async function GET(req: Request) {
  const response = new twiml.VoiceResponse();
  console.log('----------------------------------------');
  console.log('TwiML GET request received');
  console.log('Request Headers:', Object.fromEntries(req.headers.entries()));
  console.log('Request URL:', req.url);
  
  // Get the To parameter from the URL if it exists
  const url = new URL(req.url);
  const to = url.searchParams.get('To');
  const from = req.headers.get('From');
  console.log('Call details - To:', to, 'From:', from);

  if (to) {
    console.log('[OUTBOUND] Initiating outbound call to:', to);
    response.dial(to);
  } else {
    console.log('[INBOUND] Processing incoming call from:', from);
    response.say({ voice: 'alice' }, 'Incoming call. Please wait while we connect you.');
    
    console.log('Setting up dial parameters');
    const dial = response.dial({
      answerOnBridge: true,
      callerId: from || undefined
    });
    
    console.log('Connecting to client with identity: user-current');
    dial.client({
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status`
    }, 'user-current');
  }

  const twimlResponse = response.toString();
  console.log('Generated TwiML:', twimlResponse);
  console.log('----------------------------------------');

  return new Response(twimlResponse, { 
    headers: { 
      "Content-Type": "text/xml",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    } 
  });
}

export async function POST(req: Request) {
  const response = new twiml.VoiceResponse();
  console.log('----------------------------------------');
  console.log('TwiML POST request received');
  
  // Get form data from the request
  const formData = await req.formData();
  const to = formData.get('To');
  const from = formData.get('From');
  
  console.log('POST Request Form Data:', {
    To: to,
    From: from,
    Direction: formData.get('Direction'),
    CallSid: formData.get('CallSid')
  });

  if (to) {
    console.log('[OUTBOUND] Initiating outbound call to:', to);
    response.dial(to?.toString());
  } else {
    console.log('[INBOUND] Processing incoming call from:', from);
    response.say({ voice: 'alice' }, 'Incoming call. Please wait while we connect you.');
    
    console.log('Setting up dial parameters');
    const dial = response.dial({
      answerOnBridge: true,
      callerId: from?.toString() || undefined
    });
    
    console.log('Connecting to client with identity: user-current');
    dial.client({
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status`
    }, 'user-current');
  }

  const twimlResponse = response.toString();
  console.log('Generated TwiML:', twimlResponse);
  console.log('----------------------------------------');

  return new Response(twimlResponse, { 
    headers: { 
      "Content-Type": "text/xml",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    } 
  });
}
