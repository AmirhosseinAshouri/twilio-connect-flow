
import React, { useEffect, useState } from 'react';
import { TwilioDeviceProvider } from '@/components/phone/TwilioDeviceProvider';
import { PhoneUI } from '@/components/phone/PhoneUI';
import { toast } from "sonner";
import { TwilioClient } from '@/components/TwilioClient';
import { useSettings } from '@/hooks/useSettings';

const PhonePage: React.FC = () => {
  const [microphoneReady, setMicrophoneReady] = useState(false);
  const { settings, loading } = useSettings();
  
  // Check microphone permissions and display notification
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicrophoneReady(true);
        toast.success("Microphone access granted");
      } catch (error) {
        toast.error("Microphone access is required for calls");
        console.error('Microphone permission error:', error);
      }
    };
    
    checkMicrophonePermission();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center">Loading phone system...</div>;
  }

  return (
    <div className="relative">
      <TwilioDeviceProvider>
        <PhoneUI />
      </TwilioDeviceProvider>
      
      {/* Include TwilioClient for incoming calls */}
      {microphoneReady && settings && <TwilioClient />}
    </div>
  );
};

export default PhonePage;
