import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET() {
  try {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    
    response.say('Hello! This is a call from your CRM system.');
    response.pause({ length: 1 });
    response.say('Connecting you now.');

    return new NextResponse(response.toString(), {
      headers: {
        'Content-Type': 'text/xml',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error generating TwiML:', error);
    return NextResponse.json(
      { error: 'Failed to generate TwiML response' },
      { status: 500 }
    );
  }
}