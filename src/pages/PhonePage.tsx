
import React, { useState, useEffect, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CallStatus {
  status: 'idle' | 'ready' | 'calling' | 'inCall' | 'error';
  message?: string;
}

const PhonePage: React.FC = () => {
  const [device, setDevice] = useState<Device | null>(null);
  const [call, setCall] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>({ status: 'idle' });
  const [toNumber, setToNumber] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Initialize device on component mount
  useEffect(() => {
    initializeDevice();
    
    // Cleanup function to destroy device on unmount
    return () => {
      if (device) {
        console.log("Destroying Twilio device on unmount");
        device.destroy();
      }
    };
  }, []);

  const initializeDevice = async () => {
    try {
      setIsInitializing(true);
      console.log("Requesting token from Twilio function...");
      
      const { data, error } = await supabase.functions.invoke('twilio', {
        body: { action: 'getToken' }
      });

      if (error) {
        console.error("Token error:", error);
        throw error;
      }
      
      if (!data || !data.token) {
        throw new Error("No token received from the server");
      }
      
      console.log("Token received, initializing device...");

      // Request microphone permission before creating the device
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Release the stream
        console.log("Microphone permission granted");
      } catch (err) {
        console.error("Microphone access denied:", err);
        toast.error("Microphone access is required for calls");
        throw new Error("Microphone permission denied");
      }

      // Create device with the token
      const twilioDevice = new Device(data.token, {
        allowIncomingWhileBusy: true,
        // Log level for debugging
        logLevel: 'debug' 
      });

      // Setup device event listeners
      setupDeviceListeners(twilioDevice);
      
      // Register the device (connect to Twilio)
      console.log("Registering device...");
      await twilioDevice.register();
      
      setDevice(twilioDevice);
      console.log("Device initialized successfully");
      
    } catch (error) {
      console.error('Device initialization error:', error);
      toast.error("Failed to initialize phone device");
      setCallStatus({ status: 'error', message: 'Device initialization failed' });
    } finally {
      setIsInitializing(false);
    }
  };

  const setupDeviceListeners = (twilioDevice: Device) => {
    twilioDevice.on('registered', () => {
      console.log('Device registered successfully with Twilio');
      setCallStatus({ status: 'ready' });
      toast.success("Phone ready for calls");
    });

    twilioDevice.on('registrationFailed', (error: any) => {
      console.error('Device registration failed:', error);
      toast.error(`Registration failed: ${error.message || 'Unknown error'}`);
      setCallStatus({ status: 'error', message: 'Registration failed' });
    });

    twilioDevice.on('error', (error: any) => {
      console.error('Device error:', error);
      toast.error(`Phone error: ${error.message || 'Unknown error'}`);
      setCallStatus({ status: 'error', message: error.message });
    });

    twilioDevice.on('incoming', handleIncomingCall);
    twilioDevice.on('disconnect', handleDisconnect);
    
    // Additional debug event listeners
    twilioDevice.on('tokenWillExpire', () => {
      console.log('Token will expire soon');
      // You could refresh the token here
    });
    
    twilioDevice.on('unregistered', () => {
      console.log('Device unregistered from Twilio');
    });
  };

  const handleIncomingCall = (incomingCall: any) => {
    console.log('Incoming call:', incomingCall);
    setCall(incomingCall);
    setCallStatus({ status: 'inCall', message: 'Incoming call' });
    toast.success(`Incoming call from ${incomingCall.parameters.From || 'Unknown'}`);

    incomingCall.on('accept', () => {
      console.log('Call accepted');
      setCallStatus({ status: 'inCall' });
    });

    incomingCall.on('disconnect', handleDisconnect);
    incomingCall.on('cancel', handleDisconnect);
    incomingCall.on('reject', handleDisconnect);

    // Auto accept incoming calls
    incomingCall.accept().catch((error: Error) => {
      console.error('Error accepting call:', error);
      toast.error("Failed to accept incoming call");
    });
  };

  const handleDisconnect = () => {
    console.log('Call disconnected');
    setCallStatus({ status: 'ready' });
    setCall(null);
    toast.info("Call ended");
  };

  const makeCall = async () => {
    if (!device || !toNumber || callStatus.status === 'inCall' || callStatus.status === 'calling') {
      console.log("Cannot make call:", { 
        deviceExists: !!device, 
        toNumber, 
        currentStatus: callStatus.status 
      });
      return;
    }

    try {
      console.log("Initiating browser call to:", toNumber);
      setCallStatus({ status: 'calling' });
      
      // Check if audio context needs to be resumed (may be required on some browsers)
      if (audioRef.current) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        await ctx.resume();
      }
      
      // Make the outbound call using the browser-based Twilio Device
      const outgoingCall = await device.connect({
        params: {
          To: toNumber,
          // You can add additional parameters here that will be 
          // available in your TwiML when the call is connected
          From: 'browser-user'
        }
      });
      
      console.log("Call connected:", outgoingCall);
      setCall(outgoingCall);
      
      // Set up event handlers for the call
      outgoingCall.on('accept', () => {
        console.log('Call accepted');
        setCallStatus({ status: 'inCall' });
        toast.success("Call connected");
      });
      
      outgoingCall.on('disconnect', () => {
        console.log('Call disconnected');
        handleDisconnect();
      });
      
      outgoingCall.on('error', (error) => {
        console.error('Call error:', error);
        setCallStatus({ status: 'error', message: error.message });
        toast.error(`Call error: ${error.message}`);
      });
      
      // Additional call event monitoring
      outgoingCall.on('ringing', () => {
        console.log('Call is ringing');
        toast.info("Phone is ringing...");
      });
      
    } catch (error) {
      console.error('Error making call:', error);
      toast.error("Failed to make call: " + (error instanceof Error ? error.message : "Unknown error"));
      setCallStatus({ status: 'error', message: 'Failed to make call' });
    }
  };

  const hangUp = () => {
    if (call) {
      console.log("Hanging up call");
      call.disconnect();
      handleDisconnect();
    }
  };

  const reinitializeDevice = () => {
    if (device) {
      device.destroy();
      setDevice(null);
    }
    initializeDevice();
  };

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Twilio Web Phone</h2>
        <div className="p-4 rounded-lg bg-secondary">
          <p className="text-sm font-medium">
            Status: {callStatus.status}
            {callStatus.message && ` - ${callStatus.message}`}
          </p>
        </div>
        
        {callStatus.status === 'error' && (
          <button 
            onClick={reinitializeDevice}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Reconnect Phone
          </button>
        )}
        
        <div className="space-y-4">
          <input
            type="tel"
            placeholder="Enter phone number (e.g. +15551234567)"
            value={toNumber}
            onChange={(e) => setToNumber(e.target.value)}
            className="w-full p-2 border rounded-md"
            disabled={callStatus.status === 'inCall' || callStatus.status === 'calling'}
          />
          <div className="flex gap-4">
            <button 
              onClick={makeCall}
              disabled={!device || callStatus.status === 'inCall' || callStatus.status === 'calling' || isInitializing || !toNumber}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {callStatus.status === 'calling' ? 'Connecting...' : 'Call'}
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
        
        {/* Hidden audio element for browser audio context initialization */}
        <audio ref={audioRef} style={{ display: 'none' }} />
        
        {/* Debug info section */}
        <div className="mt-6 p-4 border rounded-md bg-muted text-xs">
          <p className="font-medium">Troubleshooting Info:</p>
          <ul className="mt-2 space-y-1">
            <li>• Device initialized: {device ? 'Yes' : 'No'}</li>
            <li>• Call active: {call ? 'Yes' : 'No'}</li>
            <li>• Current status: {callStatus.status}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PhonePage;
