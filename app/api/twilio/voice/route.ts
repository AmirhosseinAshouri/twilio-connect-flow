
import { NextResponse } from "next/server";
import { twiml } from "twilio";

export async function GET(req: Request) {
  const response = new twiml.VoiceResponse();
  
  // Get the To parameter from the URL if it exists
  const url = new URL(req.url);
  const to = url.searchParams.get('To');

  if (to) {
    // This is an outbound call
    response.dial(to);
  } else {
    // This is an inbound call - connect to client
    const dial = response.dial();
    dial.client('client'); // 'client' is the identity we set in the token
  }

  return new Response(response.toString(), { 
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
  
  // Get form data from the request
  const formData = await req.formData();
  const to = formData.get('To');

  if (to) {
    // This is an outbound call
    response.dial(to?.toString());
  } else {
    // This is an inbound call - connect to client
    const dial = response.dial();
    dial.client('client');
  }

  return new Response(response.toString(), { 
    headers: { 
      "Content-Type": "text/xml",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    } 
  });
}
