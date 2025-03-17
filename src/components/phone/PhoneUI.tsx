
import React, { useState, useRef, useEffect } from 'react';
import { useTwilioDevice } from './TwilioDeviceProvider';
import { PhoneStatus } from './PhoneStatus';
import { PhoneControls } from './PhoneControls';
import { PhoneTroubleshooting } from './PhoneTroubleshooting';
import { toast } from "sonner";

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
        <h2 className="text-2xl font-bold">Twilio Web Phone</h2>
        
        <PhoneStatus status={callStatus} />
        
        {callStatus.status === 'error' && (
          <button 
            onClick={reinitializeDevice}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
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
        
        {/* Make audio element visible during calls */}
        <audio 
          ref={audioRef} 
          autoPlay 
          style={{ display: call ? 'block' : 'none' }} 
          controls={!!call}
          className={call ? "w-full mt-4" : ""}
        />
        
        <PhoneTroubleshooting device={device} call={call} callStatus={callStatus} />
      </div>
    </div>
  );
};
