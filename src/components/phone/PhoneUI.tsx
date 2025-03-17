
import React, { useState, useRef, useEffect } from 'react';
import { useTwilioDevice } from './TwilioDeviceProvider';
import { PhoneStatus } from './PhoneStatus';
import { PhoneControls } from './PhoneControls';
import { PhoneTroubleshooting } from './PhoneTroubleshooting';
import { toast } from "sonner";
import { Phone } from 'lucide-react';

export const PhoneUI: React.FC = () => {
  const [toNumber, setToNumber] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const { 
    device, 
    call, 
    callStatus, 
    isInitializing, 
    makeCall, 
    hangUp, 
    reinitializeDevice 
  } = useTwilioDevice();

  // Handle automatic audio element setup when call is connected
  useEffect(() => {
    if (call && audioRef.current) {
      // Connect the call's audio stream to the audio element
      call.on('accept', () => {
        if (audioRef.current) {
          console.log("Call accepted, setting up audio stream");
          audioRef.current.srcObject = call.getRemoteStream();
          audioRef.current.play().catch(error => {
            console.error('Error playing audio:', error);
            toast.error("Failed to play audio. Please check your audio settings.");
          });
        }
      });
    }
  }, [call]);

  const handleMakeCall = () => {
    if (!toNumber) {
      toast.error("Please enter a phone number");
      return;
    }
    
    if (!device) {
      toast.error("Twilio device is not initialized");
      return;
    }
    
    makeCall(toNumber);
  };

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Phone className="h-6 w-6 text-primary" />
          Twilio Web Phone
        </h2>
        
        <PhoneStatus status={callStatus} />
        
        {callStatus.status === 'error' && (
          <button 
            onClick={reinitializeDevice}
            className="w-full px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary/90"
          >
            Reconnect Phone
          </button>
        )}
        
        <PhoneControls 
          toNumber={toNumber}
          onToNumberChange={setToNumber}
          onCall={handleMakeCall}
          onHangUp={hangUp}
          disabled={!device || callStatus.status === 'inCall' || callStatus.status === 'calling' || isInitializing}
          callInProgress={!!call}
        />
        
        {/* Make audio element always visible for debugging */}
        <div className={`mt-4 ${call ? 'block' : 'hidden'}`}>
          <p className="text-sm font-medium mb-2">Call Audio:</p>
          <audio 
            ref={audioRef} 
            autoPlay 
            controls
            className="w-full border rounded-md" 
          />
        </div>
        
        <PhoneTroubleshooting device={device} call={call} callStatus={callStatus} />
      </div>
    </div>
  );
};
