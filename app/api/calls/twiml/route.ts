import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET() {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  
  response.say('Hello! This is a call from your CRM system.');
  response.pause({ length: 1 });
  response.say('Connecting you now.');

  return new NextResponse(response.toString(), {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}