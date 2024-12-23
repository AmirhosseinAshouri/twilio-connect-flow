import express from 'express';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const setupApiServer = (app: express.Application) => {
  // Create call endpoint
  app.post('/api/calls/create', async (req, res) => {
    try {
      const { callId, to, from, notes } = req.body;

      // Get user's Twilio settings
      const { data: settings, error: settingsError } = await supabase
        .from("settings")
        .select("*")
        .single();

      if (settingsError || !settings) {
        throw new Error("Twilio settings not found");
      }

      // Initialize Twilio client
      const client = twilio(
        settings.twilio_account_sid,
        settings.twilio_auth_token
      );

      // Create call using Twilio
      const call = await client.calls.create({
        url: `${import.meta.env.VITE_APP_URL}/api/calls/twiml`,
        to,
        from,
        statusCallback: `${import.meta.env.VITE_APP_URL}/api/calls/status`,
        statusCallbackEvent: ['completed'],
      });

      // Update call record with Twilio SID
      const { error: updateError } = await supabase
        .from("calls")
        .update({ twilio_sid: call.sid })
        .eq("id", callId);

      if (updateError) throw updateError;

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
}; 