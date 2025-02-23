
import React, { useState, useEffect } from 'react';
import { Device } from '@twilio/voice-sdk';
import { toast } from "sonner";

const PhonePage = () => {
    const [device, setDevice] = useState(null);
    const [call, setCall] = useState(null);
    const [callStatus, setCallStatus] = useState('Idle');
    const [toNumber, setToNumber] = useState('');

    useEffect(() => {
        fetchToken();
        return () => {
            if (device) {
                device.destroy();
            }
        };
    }, []);

    const fetchToken = async () => {
        try {
            console.log('Fetching Twilio token...');
            const response = await fetch('http://localhost:5000/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientName: 'user-current' }) // Match the client name in TwiML
            });

            const data = await response.json();
            console.log('Token received, setting up device...');
            setupTwilioDevice(data.token);
        } catch (error) {
            console.error('Error fetching token:', error);
            toast.error("Failed to initialize phone. Please check your Twilio settings.");
        }
    };

    const setupTwilioDevice = async (token) => {
        try {
            console.log('Initializing Twilio device...');
            const twilioDevice = new Device(token, {
                enableIceRestart: true,
                debug: true // Enable debug logging
            });

            twilioDevice.on('registered', () => {
                console.log('Device registered with Twilio');
                setCallStatus('Ready to Call');
                toast.success("Phone ready for calls");
            });

            twilioDevice.on('error', (error) => {
                console.error('Twilio Device Error:', error);
                toast.error(`Phone error: ${error.message}`);
                setCallStatus('Error');
            });

            twilioDevice.on('incoming', (incomingCall) => {
                console.log('Incoming call received:', incomingCall);
                setCall(incomingCall);
                setCallStatus('Incoming Call');

                // Handle incoming call events
                incomingCall.on('accept', () => {
                    console.log('Call accepted');
                    setCallStatus('In Call');
                });

                incomingCall.on('disconnect', () => {
                    console.log('Call disconnected');
                    setCallStatus('Idle');
                    setCall(null);
                });

                incomingCall.on('cancel', () => {
                    console.log('Call canceled');
                    setCallStatus('Idle');
                    setCall(null);
                });

                // Auto accept the call
                incomingCall.accept().catch(error => {
                    console.error('Error accepting call:', error);
                    toast.error("Failed to accept incoming call");
                });
            });

            twilioDevice.on('disconnect', () => {
                console.log('Call disconnected');
                setCallStatus('Idle');
                setCall(null);
            });

            await twilioDevice.register();
            setDevice(twilioDevice);
        } catch (error) {
            console.error('Error setting up Twilio Device:', error);
            toast.error("Failed to set up phone device");
        }
    };

    const makeCall = () => {
        if (device && toNumber) {
            try {
                console.log('Making outgoing call to:', toNumber);
                const outgoingCall = device.connect({ params: { To: toNumber } });
                setCall(outgoingCall);
                setCallStatus('Calling...');

                outgoingCall.on('accept', () => {
                    console.log('Call accepted');
                    setCallStatus('In Call');
                });

                outgoingCall.on('disconnect', () => {
                    console.log('Call disconnected');
                    setCallStatus('Idle');
                    setCall(null);
                });

                outgoingCall.on('error', (error) => {
                    console.error('Call error:', error);
                    toast.error(`Call error: ${error.message}`);
                    setCallStatus('Error');
                    setCall(null);
                });
            } catch (error) {
                console.error('Error making call:', error);
                toast.error("Failed to make call");
            }
        }
    };

    const hangUp = () => {
        if (call) {
            console.log('Hanging up call');
            call.disconnect();
            setCallStatus('Idle');
            setCall(null);
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-md mx-auto space-y-6">
                <h2 className="text-2xl font-bold">Twilio Web Phone</h2>
                <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm font-medium">Status: {callStatus}</p>
                </div>
                <div className="space-y-4">
                    <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={toNumber}
                        onChange={(e) => setToNumber(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        disabled={callStatus === 'In Call'}
                    />
                    <div className="flex gap-4">
                        <button 
                            onClick={makeCall} 
                            disabled={!device || callStatus === 'In Call'}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                        >
                            Call
                        </button>
                        <button 
                            onClick={hangUp}
                            disabled={!call}
                            className="flex-1 px-4 py-2 bg-destructive text-white rounded-md hover:bg-destructive/90 disabled:opacity-50"
                        >
                            Hang Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhonePage;
