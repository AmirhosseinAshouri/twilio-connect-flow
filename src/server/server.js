require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;

app.post('/token', (req, res) => {
    const clientName = req.body.clientName || 'defaultUser';
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const token = new AccessToken(accountSid, apiKey, apiSecret, { ttl: 3600 });
    token.identity = clientName;

    const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: twimlAppSid,
        incomingAllow: true
    });

    token.addGrant(voiceGrant);

    res.json({ token: token.toJwt() });
});

app.listen(5000, () => {
    console.log('Token server running on port 5000');
});
