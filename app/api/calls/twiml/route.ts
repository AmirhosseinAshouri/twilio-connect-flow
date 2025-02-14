
import { NextResponse } from "next/server";
import { twiml } from "twilio";

export async function GET() {
  try {
    const response = new twiml.VoiceResponse();
    
    // Welcome message
    response.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Welcome to your CRM system call.');
    
    // Add a brief pause
    response.pause({ length: 1 });
    
    // Play hold music
    response.play({
      loop: 1
    }, 'http://com.twilio.music.classical.s3.amazonaws.com/BusyStrings.mp3');
    
    // Final message
    response.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Connecting you now. Please wait.');

    return new Response(response.toString(), { 
      headers: { "Content-Type": "text/xml" } 
    });
  } catch (error) {
    console.error("TwiML generation error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to generate TwiML" 
    }, { status: 500 });
  }
}
