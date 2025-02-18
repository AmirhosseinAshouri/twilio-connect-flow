
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

  useEffect(() => {
    const setupDevice = async () => {
      try {
        // Get Twilio token from our edge function
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const response = await fetch('/api/twilio/token');
        const { token } = await response.json();

        if (!token) {
          console.error('No token received');
          return;
        }

        // Create new device with correct options
        const newDevice = new Device(token, {
          codecPreferences: ["opus", "pcmu"],
          allowIncomingWhileBusy: true,
          enableRingingState: true,
        });

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
        });

        setDevice(newDevice);

        return () => {
          newDevice.destroy();
        };
      } catch (error) {
        console.error('Error setting up Twilio device:', error);
        toast({
          title: "Error",
          description: "Failed to set up call handling",
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

  const handleAcceptCall = () => {
    if (incomingCall) {
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
