import { useState, useEffect } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from './use-toast';
import { useSettings } from './useSettings';
import { useNavigate } from 'react-router-dom';

export function useTwilioVoice() {
  const [device, setDevice] = useState<Device | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const { toast } = useToast();
  const { settings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeDevice = async () => {
      try {
        // First check if Twilio settings are configured
        if (!settings?.twilio_account_sid || !settings?.twilio_auth_token) {
          console.log('Twilio settings not configured');
          toast({
            title: "Twilio Settings Required",
            description: "Please configure your Twilio settings in the Settings page before making calls.",
            variant: "destructive",
          });
          navigate('/settings');
          return;
        }

        // Get access token from our edge function
        const { data, error } = await supabase.functions.invoke('get-twilio-token');

        if (error) {
          console.error('Error getting token:', error);
          let errorMessage = "Failed to initialize voice client";
          
          // Check if the error is due to missing Twilio settings
          if (error.message?.includes('Incomplete Twilio settings')) {
            errorMessage = "Please configure your Twilio settings in the Settings page";
            navigate('/settings');
          }
          
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          return;
        }

        if (!data?.token) {
          console.error('No token received');
          toast({
            title: "Error",
            description: "Failed to initialize voice client. No token received.",
            variant: "destructive",
          });
          return;
        }

        // Create a new Twilio Device
        const newDevice = new Device(data.token);

        await newDevice.register();
        setDevice(newDevice);
        setIsReady(true);

        // Handle incoming calls
        newDevice.on('incoming', (call) => {
          setActiveCall(call);
          // Auto-answer for now, but you might want to show a UI prompt
          call.accept();
        });

      } catch (err) {
        console.error('Error initializing Twilio device:', err);
        toast({
          title: "Error",
          description: "Failed to initialize voice client. Please check your settings.",
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
  }, [toast, settings, navigate]);

  const makeCall = async (to: string) => {
    if (!device || !isReady) {
      toast({
        title: "Error",
        description: "Voice client not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(true);
      const call = await device.connect({ params: { To: to } });
      setActiveCall(call);

      call.on('accept', () => {
        setIsConnecting(false);
      });

      call.on('disconnect', () => {
        setActiveCall(null);
        setIsConnecting(false);
      });

      call.on('error', (error) => {
        console.error('Call error:', error);
        setActiveCall(null);
        setIsConnecting(false);
        toast({
          title: "Call Error",
          description: error.message || "An error occurred during the call",
          variant: "destructive",
        });
      });

    } catch (err) {
      console.error('Error making call:', err);
      setIsConnecting(false);
      toast({
        title: "Error",
        description: "Failed to initiate call. Please try again.",
        variant: "destructive",
      });
    }
  };

  const hangUp = () => {
    if (activeCall) {
      activeCall.disconnect();
      setActiveCall(null);
    }
  };

  return {
    makeCall,
    hangUp,
    isReady,
    isConnecting,
    hasActiveCall: !!activeCall
  };
}