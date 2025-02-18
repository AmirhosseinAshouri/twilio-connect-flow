import React, { useEffect, useState } from "react";
import { Device, Call } from "@twilio/voice-sdk";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { IncomingCallDialog } from "./IncomingCallDialog";
import { CallWindow } from "./CallWindow";
import { Mic, MicOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TwilioClient = () => {
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentCall, setCurrentCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState<'initiated' | 'connecting' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled'>('initiated');
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasMicrophonePermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      setHasMicrophonePermission(false);
      return false;
    }
  };

  const requestMicrophoneAccess = async () => {
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to make calls.",
        variant: "destructive",
      });
    }
    return hasPermission;
  };

  useEffect(() => {
    const initializeDevice = async () => {
      try {
        const hasPermission = await checkMicrophonePermission();
        if (!hasPermission) return;

        const { data, error } = await supabase.functions.invoke('get-twilio-token');
        
        if (error || !data.token) {
          throw new Error(error?.message || "Failed to get token");
        }

        const newDevice = new Device(data.token, {
          audioConstraints: {
            autoGainControl: true,
            echoCancellation: true,
            noiseSuppression: true,
          }
        });

        await newDevice.register();
        setDevice(newDevice);

        newDevice.on('error', (error) => {
          console.error('Twilio device error:', error);
          toast({
            title: "Error",
            description: error.message || "An error occurred with the call device",
            variant: "destructive",
          });
        });

        newDevice.on('registered', () => {
          console.log('Twilio device registered');
          toast({
            title: "Ready",
            description: "Call device is ready to use",
          });
        });
        
        newDevice.on('error', (error) => {
          console.error('❌ Twilio Device Registration Error:', error);
        });
        
        newDevice.on('unregistered', () => {
          console.log('Twilio device unregistered');
        });

        newDevice.on('incoming', (call) => {
          console.log('Incoming call from:', call.parameters.From);
          setIncomingCall(call);
          
          call.on('cancel', () => {
            setIncomingCall(null);
            setCallStatus('canceled');
          });

          call.on('accept', () => {
            setCallStatus('in-progress');
          });

          call.on('disconnect', () => {
            setCallStatus('completed');
          });
        });

      } catch (error) {
        console.error("Failed to initialize Twilio device:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to initialize call device",
          variant: "destructive",
        });
      }
    };

    initializeDevice();

    return () => {
      if (device) {
        device.destroy();
      }
    };
  }, [toast]);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      const hasPermission = await requestMicrophoneAccess();
      if (!hasPermission) return;

      setCallStatus('connecting');
      await incomingCall.accept();
      setCurrentCall(incomingCall);
      setIncomingCall(null);
      setCallStatus('in-progress');

      incomingCall.on('disconnect', () => {
        setCurrentCall(null);
        setCallStatus('completed');
      });

    } catch (error) {
      console.error("Error accepting call:", error);
      toast({
        title: "Error",
        description: "Failed to accept call",
        variant: "destructive",
      });
      setCallStatus('failed');
    }
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;

    try {
      incomingCall.reject();
      setIncomingCall(null);
      setCallStatus('canceled');
    } catch (error) {
      console.error("Error rejecting call:", error);
      toast({
        title: "Error",
        description: "Failed to reject call",
        variant: "destructive",
      });
    }
  };

  const makeCall = async (to: string) => {
    if (!device) {
      toast({
        title: "Error",
        description: "Call device not initialized",
        variant: "destructive",
      });
      return;
    }

    const hasPermission = await requestMicrophoneAccess();
    if (!hasPermission) return;

    setIsConnecting(true);
    setCallStatus('connecting');
    try {
      const connection = await device.connect({
        params: { To: to }
      });

      setCurrentCall(connection);

      connection.on('accept', () => {
        console.log('Call accepted');
        setCallStatus('in-progress');
        toast({
          title: "Success",
          description: "Call connected",
        });
      });

      connection.on('disconnect', () => {
        console.log('Call disconnected');
        setIsConnecting(false);
        setCurrentCall(null);
        setCallStatus('completed');
        toast({
          title: "Call Ended",
          description: "Call has been disconnected",
        });
      });

    } catch (error) {
      console.error("Call error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to make call",
        variant: "destructive",
      });
      setIsConnecting(false);
      setCallStatus('failed');
    }
  };

  const handleHangUp = () => {
    if (currentCall) {
      currentCall.disconnect();
      setCurrentCall(null);
      setCallStatus('completed');
    }
  };

  if (hasMicrophonePermission === false) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Microphone Access Required</AlertTitle>
        <AlertDescription>
          Please allow microphone access in your browser settings to make calls.
          <Button 
            className="mt-2" 
            onClick={() => requestMicrophoneAccess()}
          >
            <Mic className="mr-2 h-4 w-4" />
            Request Microphone Access
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={() => makeCall("+1234567890")} 
        disabled={!device || isConnecting || !!currentCall || !!incomingCall}
        className="w-full"
      >
        {isConnecting ? "Connecting..." : "Make Call"}
      </Button>

      <IncomingCallDialog
        open={!!incomingCall}
        phoneNumber={incomingCall?.parameters.From || "Unknown"}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

      <CallWindow
        open={!!currentCall}
        onClose={() => setCurrentCall(null)}
        status={callStatus}
        phoneNumber={currentCall?.parameters.To || incomingCall?.parameters.From || ""}
        onHangUp={handleHangUp}
      />
    </div>
  );
};

export default TwilioClient;
