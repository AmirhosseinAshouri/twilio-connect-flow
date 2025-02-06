import React, { useState, useEffect } from 'react';
import { Device } from '@twilio/voice-sdk';

const PhonePage = () => {
    const [device, setDevice] = useState(null);
    const [call, setCall] = useState(null);
    const [callStatus, setCallStatus] = useState('Idle');
    const [toNumber, setToNumber] = useState('');

    useEffect(() => {
        fetchToken();
    }, []);

    const fetchToken = async () => {
        try {
            const response = await fetch('http://localhost:5000/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientName: 'user' })
            });

            const data = await response.json();
            setupTwilioDevice(data.token);
        } catch (error) {
            console.error('Error fetching token:', error);
        }
    };

    const setupTwilioDevice = async (token) => {
        try {
            const twilioDevice = new Device(token, { enableIceRestart: true });

            twilioDevice.on('registered', () => setCallStatus('Ready to Call'));
            twilioDevice.on('error', (error) => console.error('Twilio Error:', error));
            twilioDevice.on('incoming', (incomingCall) => {
                setCall(incomingCall);
                incomingCall.accept();
                setCallStatus('In Call');
            });
            twilioDevice.on('disconnect', () => setCallStatus('Idle'));

            await twilioDevice.register();
            setDevice(twilioDevice);
        } catch (error) {
            console.error('Error setting up Twilio Device:', error);
        }
    };

    const makeCall = () => {
        if (device) {
            const outgoingCall = device.connect({ params: { To: toNumber } });
            setCall(outgoingCall);
            setCallStatus('Calling...');
        }
    };

    const hangUp = () => {
        if (call) {
            call.disconnect();
            setCallStatus('Idle');
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Twilio Web Phone</h2>
            <p>Status: {callStatus}</p>
            <input
                type="text"
                placeholder="Enter phone number"
                value={toNumber}
                onChange={(e) => setToNumber(e.target.value)}
            />
            <button onClick={makeCall} disabled={!device}>Call</button>
            <button onClick={hangUp}>Hang Up</button>
        </div>
    );
};

export default PhonePage;
