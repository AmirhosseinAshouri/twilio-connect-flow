
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log('----------------------------------------');
  console.log('Twilio Call Status Update Received');
  
  const formData = await req.formData();
  const statusUpdate = {
    CallSid: formData.get('CallSid'),
    CallStatus: formData.get('CallStatus'),
    CallDuration: formData.get('CallDuration'),
    From: formData.get('From'),
    To: formData.get('To'),
    Direction: formData.get('Direction'),
    Timestamp: new Date().toISOString()
  };

  console.log('Call Status Update:', JSON.stringify(statusUpdate, null, 2));
  console.log('----------------------------------------');

  return NextResponse.json({ success: true });
}

export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
