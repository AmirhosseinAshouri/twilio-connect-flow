import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function GET() {
  try {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    
    // Add a greeting
    response.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Welcome to the CRM system call.');

    // Add a brief pause
    response.pause({ length: 1 });

    // Add some background music while connecting
    response.play({
      loop: 1
    }, 'http://com.twilio.music.classical.s3.amazonaws.com/BusyStrings.mp3');

    // Final message before connecting
    response.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Connecting you now. Please wait.');

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