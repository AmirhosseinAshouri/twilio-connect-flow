
import { useEffect, useState } from "react";
import { Device } from "@twilio/voice-sdk";
import { useToast } from "@/hooks/use-toast";
import { IncomingCallDialog } from "./IncomingCallDialog";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";

export function TwilioClient() {
  const [device, setDevice] = useState<Device | null>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const { settings } = useSettings();
  const { toast } = useToast();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize audio context on component mount
  useEffect(() => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(context);

    // Cleanup
    return () => {
      if (context.state !== 'closed') {
        context.close();
      }
    };
  }, []);

  useEffect(() => {
    const setupDevice = async () => {
      try {
        // Ensure audio context is resumed after user interaction
        if (audioContext && audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Request microphone permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream after permission check

        // Get Twilio token from our edge function
        const { data, error } = await supabase.functions.invoke('get-twilio-token');
        
        if (error) {
          console.error('Error getting token:', error);
          throw error;
        }

        if (!data?.token) {
          throw new Error('No token received');
        }

        console.log('Received token from edge function');

        // Destroy existing device if any
        if (device) {
          console.log('Destroying existing device');
          device.destroy();
        }

        // Create new device with correct options
        const newDevice = new Device(data.token, {
          codecPreferences: ['OPUS', 'PCMU'],
          edge: ['sydney', 'ashburn'],
          maxCallSignalingTimeoutMs: 30000
        });

        // Register the device
        console.log('Registering device...');
        await newDevice.register();
        console.log('Device registered successfully');

        // Set up device event handlers
        newDevice.on('incoming', (call) => {
          console.log('Incoming call received');
          setIncomingCall(call);

          // Set up call event handlers
          call.on('accept', () => {
            console.log('Call accepted');
            toast({
              title: "Call Connected",
              description: "You are now connected to the caller",
            });
          });

          call.on('disconnect', () => {
            console.log('Call disconnected');
            setIncomingCall(null);
            toast({
              title: "Call Ended",
              description: "The call has been disconnected",
            });
          });

          call.on('cancel', () => {
            console.log('Call canceled');
            setIncomingCall(null);
            toast({
              title: "Call Canceled",
              description: "The incoming call was canceled",
            });
          });

          call.on('error', (error) => {
            console.error('Call error:', error);
            toast({
              title: "Call Error",
              description: error.message || "An error occurred during the call",
              variant: "destructive",
            });
          });
        });

        newDevice.on('error', (error) => {
          console.error('Device error:', error);
          toast({
            title: "Device Error",
            description: error.message || "An error occurred with the call device",
            variant: "destructive",
          });
        });

        newDevice.on('registered', () => {
          console.log('Device registered with Twilio');
          toast({
            title: "Device Ready",
            description: "Your device is ready to receive calls",
          });
        });

        newDevice.on('unregistered', () => {
          console.log('Device unregistered from Twilio');
        });

        setDevice(newDevice);
      } catch (error) {
        console.error('Error setting up Twilio device:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to set up call handling",
          variant: "destructive",
        });
      }
    };

    if (settings?.twilio_account_sid) {
      setupDevice();
    }

    return () => {
      if (device) {
        device.destroy();
      }
    };
  }, [settings?.twilio_account_sid]);

  const handleAcceptCall = async () => {
    if (incomingCall) {
      // Resume audio context on user interaction
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      incomingCall.accept();
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      incomingCall.reject();
      setIncomingCall(null);
    }
  };

  return (
    <>
      {incomingCall && (
        <IncomingCallDialog
          open={!!incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          phoneNumber={incomingCall.parameters.From || 'Unknown'}
        />
      )}
    </>
  );
}
