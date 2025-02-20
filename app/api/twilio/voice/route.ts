
import { NextResponse } from "next/server";
import { twiml } from "twilio";

export async function GET(req: Request) {
  const response = new twiml.VoiceResponse();
  console.log('TwiML GET request received');
  
  // Get the To parameter from the URL if it exists
  const url = new URL(req.url);
  const to = url.searchParams.get('To');

  if (to) {
    console.log('Outbound call to:', to);
    // This is an outbound call
    response.dial(to);
  } else {
    console.log('Inbound call - connecting to client');
    // This is an inbound call - connect to client
    const dial = response.dial();
    // Identity must match exactly with what's set in token
    dial.client('user-current');
  }

  const twimlResponse = response.toString();
  console.log('TwiML response:', twimlResponse);

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
  console.log('TwiML POST request received');
  
  // Get form data from the request
  const formData = await req.formData();
  const to = formData.get('To');

  if (to) {
    console.log('Outbound call to:', to);
    // This is an outbound call
    response.dial(to?.toString());
  } else {
    console.log('Inbound call - connecting to client');
    // This is an inbound call - connect to client
    const dial = response.dial();
    // Identity must match exactly with what's set in token
    dial.client('user-current');
  }

  const twimlResponse = response.toString();
  console.log('TwiML response:', twimlResponse);

  return new Response(twimlResponse, { 
    headers: { 
      "Content-Type": "text/xml",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    } 
  });
}
