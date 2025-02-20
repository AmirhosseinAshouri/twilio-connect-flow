
import { useEffect, useState } from "react";
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
    if (!audioContext) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      await context.resume();
      setAudioContext(context);
      return context;
    }
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    return audioContext;
  };

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [audioContext]);

  const setupDevice = async () => {
    try {
      // Initialize audio context first
      await initializeAudioContext();

      // Request microphone permission
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
      const codecPreferences: CodecPreferences = ['opus', 'pcmu'];
      const newDevice = new Device(data.token, {
        // @ts-ignore - The type definitions are incorrect, but this is the correct usage
        codecPreferences,
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
        call.on('accept', async () => {
          console.log('Call accepted');
          // Initialize audio context when call is accepted
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

  const handleAcceptCall = async () => {
    if (incomingCall) {
      // Initialize audio context on call accept
      await initializeAudioContext();
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
    <div className="flex flex-col items-center gap-4">
      {!isInitialized && settings?.twilio_account_sid && (
        <Button 
          onClick={setupDevice}
          className="flex items-center gap-2"
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
