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

// Configure CORS to accept requests from any origin during development
app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true,
  optionsSuccessStatus: 204,
}));

app.use(express.json());

// Create call endpoint
app.post('/api/calls/create', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    // Verify the user's session
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { callId, to, notes } = req.body;
    console.log('Received call request:', { callId, to, notes });

    // Get user's Twilio settings
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (settingsError) {
      console.error('Settings fetch error:', settingsError);
      return res.status(500).json({ error: "Failed to fetch Twilio settings" });
    }

    if (!settings || !settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_phone_number) {
      return res.status(400).json({ error: "Please configure your Twilio settings in the Settings page first" });
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
      .eq("id", callId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error('Call update error:', updateError);
      return res.status(500).json({ error: "Failed to update call record" });
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

// TwiML endpoint with enhanced call flow
app.get('/api/calls/twiml', (req, res) => {
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

  // Set response headers
  res.type('text/xml');
  res.send(response.toString());
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});