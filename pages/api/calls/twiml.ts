import { NextApiRequest, NextApiResponse } from 'next';
import { twiml } from 'twilio';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = new twiml.VoiceResponse();
  
  response.say('Hello! This is a call from your CRM system.');
  response.pause({ length: 1 });
  response.say('Connecting you now.');

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(response.toString());
} 