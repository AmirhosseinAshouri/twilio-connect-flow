import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    initializeDevice();
    return () => {
      if (device) {
        device.destroy();
      }
    };
  }, []);

  const initializeDevice = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('twilio', {
        body: { action: 'getToken' }
      });

      if (error) throw error;

      // Create device with valid options that match the type requirements
      const twilioDevice = new Device(data.token, {
        allowIncomingWhileBusy: true
      });

      setupDeviceListeners(twilioDevice);
      await twilioDevice.register();
      setDevice(twilioDevice);
    } catch (error) {
      console.error('Device initialization error:', error);
      toast.error("Failed to initialize phone device");
      setCallStatus({ status: 'error', message: 'Device initialization failed' });
    }
  };

  const setupDeviceListeners = (twilioDevice: Device) => {
    twilioDevice.on('registered', () => {
      console.log('Device registered');
      setCallStatus({ status: 'ready' });
      toast.success("Phone ready for calls");
    });

    twilioDevice.on('error', (error) => {
      console.error('Device error:', error);
      toast.error(`Phone error: ${error.message}`);
      setCallStatus({ status: 'error', message: error.message });
    });

    twilioDevice.on('incoming', handleIncomingCall);
    twilioDevice.on('disconnect', handleDisconnect);
  };

  const handleIncomingCall = (incomingCall: any) => {
    console.log('Incoming call:', incomingCall);
    setCall(incomingCall);
    setCallStatus({ status: 'inCall', message: 'Incoming call' });

    incomingCall.on('accept', () => {
      console.log('Call accepted');
      setCallStatus({ status: 'inCall' });
    });

    incomingCall.on('disconnect', handleDisconnect);
    incomingCall.on('cancel', handleDisconnect);

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
  };

  const makeCall = async () => {
    if (!device || !toNumber) return;

    try {
      const { data, error } = await supabase.functions.invoke('twilio', {
        body: { action: 'makeCall', toNumber }
      });

      if (error) throw error;

      setCallStatus({ status: 'calling' });
      toast.success("Call initiated");
    } catch (error) {
      console.error('Error making call:', error);
      toast.error("Failed to make call");
      setCallStatus({ status: 'error', message: 'Failed to make call' });
    }
  };

  const hangUp = () => {
    if (call) {
      call.disconnect();
      handleDisconnect();
    }
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
        <div className="space-y-4">
          <input
            type="tel"
            placeholder="Enter phone number"
            value={toNumber}
            onChange={(e) => setToNumber(e.target.value)}
            className="w-full p-2 border rounded-md"
            disabled={callStatus.status === 'inCall'}
          />
          <div className="flex gap-4">
            <button 
              onClick={makeCall}
              disabled={!device || callStatus.status === 'inCall'}
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
