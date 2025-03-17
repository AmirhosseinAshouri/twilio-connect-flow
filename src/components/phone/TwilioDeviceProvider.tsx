
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Device } from '@twilio/voice-sdk';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CallStatus {
  status: 'idle' | 'ready' | 'calling' | 'inCall' | 'error';
  message?: string;
}

interface TwilioDeviceContextProps {
  device: Device | null;
  call: any;
  callStatus: CallStatus;
  isInitializing: boolean;
  initializeDevice: () => Promise<void>;
  makeCall: (toNumber: string) => Promise<void>;
  hangUp: () => void;
  reinitializeDevice: () => void;
}

const TwilioDeviceContext = createContext<TwilioDeviceContextProps | undefined>(undefined);

export const useTwilioDevice = () => {
  const context = useContext(TwilioDeviceContext);
  if (!context) {
    throw new Error('useTwilioDevice must be used within a TwilioDeviceProvider');
  }
  return context;
};

interface TwilioDeviceProviderProps {
  children: React.ReactNode;
}

export const TwilioDeviceProvider: React.FC<TwilioDeviceProviderProps> = ({ children }) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [call, setCall] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>({ status: 'idle' });
  const [isInitializing, setIsInitializing] = useState(false);
  
  const handleDisconnect = useCallback(() => {
    console.log('Call disconnected');
    setCallStatus({ status: 'ready' });
    setCall(null);
    toast.info("Call ended");
  }, []);

  const setupDeviceListeners = useCallback((twilioDevice: Device) => {
    // Best practice: Add listeners before registration
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

    twilioDevice.on('incoming', (incomingCall: any) => {
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

      incomingCall.accept().catch((error: Error) => {
        console.error('Error accepting call:', error);
        toast.error("Failed to accept incoming call");
      });
    });

    twilioDevice.on('disconnect', handleDisconnect);
    
    twilioDevice.on('tokenWillExpire', () => {
      console.log('Token will expire soon');
      // Best practice: Consider refreshing the token here
    });
    
    twilioDevice.on('unregistered', () => {
      console.log('Device unregistered from Twilio');
    });

    console.log('All device event listeners set up');
  }, [handleDisconnect]);

  const initializeDevice = useCallback(async () => {
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

      try {
        // Best practice: Request microphone permissions before initializing Device
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Release the stream
        console.log("Microphone permission granted");
      } catch (err) {
        console.error("Microphone access denied:", err);
        toast.error("Microphone access is required for calls");
        throw new Error("Microphone permission denied");
      }

      // Create device with valid options (per Twilio docs)
      const twilioDevice = new Device(data.token, {
        allowIncomingWhileBusy: true,
        logLevel: 'debug',
        // Use Twilio recommended edges
        edge: ['ashburn', 'sydney', 'roaming'],
        // Increase signaling timeout for better reliability
        maxCallSignalingTimeoutMs: 30000
      });

      setupDeviceListeners(twilioDevice);
      
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
  }, [setupDeviceListeners]);

  const makeCall = useCallback(async (toNumber: string) => {
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
      
      // Best practice: Ensure audio context is active
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      await ctx.resume();
      console.log("Audio context resumed");
      
      // Notify backend about the call (for tracking)
      await supabase.functions.invoke('twilio', {
        body: { action: 'makeCall', toNumber }
      });
      
      console.log("Connecting via device.connect() with params:", { To: toNumber, From: 'browser-user' });
      
      // Best practice: Check device state before attempting connection
      if (device.state !== "registered") {
        console.warn("Device not in registered state:", device.state);
        toast.warning("Phone system not fully connected. Trying anyway...");
        
        // Best practice: Attempt to register again if not registered
        try {
          await device.register();
          console.log("Device re-registered successfully");
        } catch (registerError) {
          console.error("Failed to re-register device:", registerError);
        }
      }
      
      // Best practice: Use proper error handling for connect()
      const outgoingCall = await device.connect({
        params: {
          To: toNumber,
          From: 'browser-user'
        }
      });
      
      console.log("Call object created:", outgoingCall);
      setCall(outgoingCall);
      
      // Best practice: Set up all event handlers immediately after connect
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
      
      outgoingCall.on('ringing', () => {
        console.log('Call is ringing');
        toast.info("Phone is ringing...");
      });
      
      // Best practice: Add warning event handler
      outgoingCall.on('warning', (warning) => {
        console.warn('Call warning:', warning);
        toast.warning(`Call warning: ${warning.message || 'Connection issue detected'}`);
      });
      
      console.log("All call event handlers set up");
      
    } catch (error) {
      console.error('Error making call:', error);
      toast.error("Failed to make call: " + (error instanceof Error ? error.message : "Unknown error"));
      setCallStatus({ status: 'error', message: 'Failed to make call' });
    }
  }, [device, callStatus, handleDisconnect]);

  const hangUp = useCallback(() => {
    if (call) {
      console.log("Hanging up call");
      call.disconnect();
      handleDisconnect();
    }
  }, [call, handleDisconnect]);

  const reinitializeDevice = useCallback(() => {
    if (device) {
      device.destroy();
      setDevice(null);
    }
    initializeDevice();
  }, [device, initializeDevice]);

  useEffect(() => {
    initializeDevice();
    
    return () => {
      if (device) {
        console.log("Destroying Twilio device on unmount");
        device.destroy();
      }
    };
  }, []);

  const value = {
    device,
    call,
    callStatus,
    isInitializing,
    initializeDevice,
    makeCall,
    hangUp,
    reinitializeDevice
  };

  return (
    <TwilioDeviceContext.Provider value={value}>
      {children}
    </TwilioDeviceContext.Provider>
  );
};
