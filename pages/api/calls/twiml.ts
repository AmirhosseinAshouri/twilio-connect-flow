import { NextApiRequest, NextApiResponse } from 'next';
import { twiml } from 'twilio';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = new twiml.VoiceResponse();
  
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

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(response.toString());
}