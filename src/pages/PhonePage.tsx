
import React, { useEffect } from 'react';
import { TwilioDeviceProvider } from '@/components/phone/TwilioDeviceProvider';
import { PhoneUI } from '@/components/phone/PhoneUI';
import { toast } from "sonner";

const PhonePage: React.FC = () => {
  // Display a notification when the page loads to remind users about microphone permissions
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        toast.success("Microphone access granted");
      } catch (error) {
        toast.error("Microphone access is required for calls");
        console.error('Microphone permission error:', error);
      }
    };
    
    checkMicrophonePermission();
  }, []);

  return (
    <TwilioDeviceProvider>
      <PhoneUI />
    </TwilioDeviceProvider>
  );
};

export default PhonePage;
