
import React, { useState, useRef } from 'react';
import { useTwilioDevice } from './TwilioDeviceProvider';
import { PhoneStatus } from './PhoneStatus';
import { PhoneControls } from './PhoneControls';
import { PhoneTroubleshooting } from './PhoneTroubleshooting';

export const PhoneUI: React.FC = () => {
  const [toNumber, setToNumber] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const { device, call, callStatus, isInitializing, makeCall, hangUp, reinitializeDevice } = useTwilioDevice();

  const handleMakeCall = () => {
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
        
        <audio ref={audioRef} style={{ display: 'none' }} />
        
        <PhoneTroubleshooting device={device} call={call} callStatus={callStatus} />
      </div>
    </div>
  );
};
