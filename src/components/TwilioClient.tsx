
import { useEffect, useState, useCallback } from "react";
import { Device } from "@twilio/voice-sdk";
import { useToast } from "@/hooks/use-toast";
import { IncomingCallDialog } from "./IncomingCallDialog";
import { useSettings } from "@/hooks/useSettings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";

type CodecPreferences = ("opus" | "pcmu")[];

export function TwilioClient() {
  const [device, setDevice] = useState<Device | null>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const { settings } = useSettings();
  const { toast } = useToast();
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio context lazily on the first user interaction
  const initializeAudioContext = async () => {
    console.log('Initializing audio context...');
    if (!audioContext) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      await context.resume();
      setAudioContext(context);
      console.log('New audio context created and resumed');
      return context;
    }
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
      console.log('Existing audio context resumed from suspended state');
    }
    return audioContext;
  };

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContext && audioContext.state !== 'closed') {
        console.log('Cleaning up audio context');
        audioContext.close();
      }
    };
  }, [audioContext]);

  const setupDevice = useCallback(async () => {
    console.log('----------------------------------------');
    console.log('Setting up Twilio device...');
    try {
      // Initialize audio context first
      await initializeAudioContext();

      console.log('Requesting microphone permission...');
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('Microphone permission granted');

      console.log('Fetching Twilio token...');
      // Get Twilio token from our edge function
      const { data, error } = await supabase.functions.invoke('get-twilio-token');
      
      if (error) {
        console.error('Error getting token:', error);
        throw error;
      }

      if (!data?.token) {
        throw new Error('No token received');
      }

      console.log('Token received successfully');

      // Destroy existing device if any
      if (device) {
        console.log('Destroying existing device');
        device.destroy();
      }

      console.log('Creating new Twilio Device instance...');
      // Create new device with correct options
      const codecPreferences: CodecPreferences = ['opus', 'pcmu'];
      const newDevice = new Device(data.token, {
        // @ts-ignore - The type definitions are incorrect, but this is the correct usage
        codecPreferences,
        edge: ['sydney', 'ashburn'],
        maxCallSignalingTimeoutMs: 30000
      });

      // Set up device event handlers before registration
      console.log('Setting up device event handlers...');
      
      newDevice.on('incoming', (call) => {
        console.log('----------------------------------------');
        console.log('INCOMING CALL RECEIVED:', {
          from: call.parameters.From,
          to: call.parameters.To,
          callSid: call.parameters.CallSid,
          direction: call.parameters.Direction
        });

        // Force React to re-render by creating a new state update
        setIncomingCall(prevCall => {
          if (prevCall) {
            console.log('Rejecting previous call as new call is incoming');
            prevCall.reject();
          }
          return call;
        });

        toast({
          title: "Incoming Call",
          description: `Incoming call from ${call.parameters.From || 'Unknown'}`,
        });

        // Set up call event handlers
        call.on('accept', async () => {
          console.log('Call accepted - initializing audio');
          await initializeAudioContext();
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
          console.log('Call canceled by caller');
          setIncomingCall(null);
          toast({
            title: "Call Canceled",
            description: "The incoming call was canceled",
          });
        });

        call.on('error', (error) => {
          console.error('Call error:', error);
          setIncomingCall(null);
          toast({
            title: "Call Error",
            description: error.message || "An error occurred during the call",
            variant: "destructive",
          });
        });

        console.log('Call event handlers set up successfully');
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
        console.log('Device successfully registered with Twilio');
        setIsInitialized(true);
        toast({
          title: "Device Ready",
          description: "Your device is ready to receive calls",
        });
      });

      newDevice.on('unregistered', () => {
        console.log('Device unregistered from Twilio');
        setIsInitialized(false);
      });

      // Register the device after setting up handlers
      console.log('Registering device with Twilio...');
      await newDevice.register();
      console.log('Device registration completed');

      setDevice(newDevice);
      console.log('Device setup completed successfully');
      console.log('----------------------------------------');

    } catch (error) {
      console.error('Error in device setup:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set up call handling",
        variant: "destructive",
      });
    }
  }, [device, audioContext, toast]);

  // Auto-initialize when settings are available
  useEffect(() => {
    if (settings?.twilio_account_sid && !isInitialized) {
      console.log('Settings detected, initializing device...');
      setupDevice();
    }
    
    return () => {
      if (device) {
        console.log('Cleaning up device...');
        device.destroy();
        setDevice(null);
        setIsInitialized(false);
      }
    };
  }, [settings?.twilio_account_sid, setupDevice, device, isInitialized]);

  const handleAcceptCall = async () => {
    if (incomingCall) {
      console.log('Accepting incoming call...');
      await initializeAudioContext();
      incomingCall.accept();
    }
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      console.log('Rejecting incoming call...');
      incomingCall.reject();
      setIncomingCall(null);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isInitialized && settings?.twilio_account_sid && (
        <Button 
          onClick={setupDevice}
          className="flex items-center gap-2 shadow-lg"
        >
          <Phone className="h-4 w-4" />
          Initialize Phone System
        </Button>
      )}
      
      {incomingCall && (
        <IncomingCallDialog
          open={!!incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
          phoneNumber={incomingCall.parameters.From || 'Unknown'}
        />
      )}
    </div>
  );
}
