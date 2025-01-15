import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

app.use(cors());
app.use(express.json());

// Create call endpoint
app.post('/api/calls/create', async (req, res) => {
  try {
    const { callId, to, from, notes } = req.body;
    console.log('Received call request:', { callId, to, from, notes });

    // Get user's Twilio settings
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .single();

    if (settingsError) {
      console.error('Settings fetch error:', settingsError);
      throw new Error("Failed to fetch Twilio settings");
    }

    if (!settings || !settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_phone_number) {
      throw new Error("Please configure your Twilio settings in the Settings page first");
    }

    // Initialize Twilio client
    const client = twilio(
      settings.twilio_account_sid,
      settings.twilio_auth_token
    );

    // Create call using Twilio
    const call = await client.calls.create({
      url: `${process.env.APP_URL}/api/calls/twiml`,
      to,
      from: settings.twilio_phone_number,
      statusCallback: `${process.env.APP_URL}/api/calls/status`,
      statusCallbackEvent: ['completed'],
    });

    console.log('Call created successfully:', call.sid);

    // Update call record with Twilio SID
    const { error: updateError } = await supabase
      .from("calls")
      .update({ 
        twilio_sid: call.sid,
        status: 'initiated'
      })
      .eq("id", callId);

    if (updateError) {
      console.error('Call update error:', updateError);
      throw updateError;
    }

    res.json({ success: true, sid: call.sid });
  } catch (error) {
    console.error('Call creation error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Status callback endpoint
app.post('/api/calls/status', async (req, res) => {
  try {
    const { CallSid, CallDuration, CallStatus } = req.body;

    const { error } = await supabase
      .from('calls')
      .update({
        duration: parseInt(CallDuration) || 0,
        status: CallStatus,
      })
      .eq('twilio_sid', CallSid);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Status callback error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// TwiML endpoint
app.get('/api/calls/twiml', (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();
  
  response.say('Hello! This is a call from your CRM system.');
  response.pause({ length: 1 });
  response.say('Connecting you now.');

  res.type('text/xml');
  res.send(response.toString());
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 