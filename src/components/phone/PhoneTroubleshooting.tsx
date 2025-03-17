
import React from 'react';
import { Device } from '@twilio/voice-sdk';

interface CallStatus {
  status: 'idle' | 'ready' | 'calling' | 'inCall' | 'error';
  message?: string;
}

interface PhoneTroubleshootingProps {
  device: Device | null;
  call: any;
  callStatus: CallStatus;
}

export const PhoneTroubleshooting: React.FC<PhoneTroubleshootingProps> = ({
  device,
  call,
  callStatus
}) => {
  return (
    <div className="mt-6 p-4 border rounded-md bg-muted text-xs">
      <p className="font-medium">Troubleshooting Info:</p>
      <ul className="mt-2 space-y-1">
        <li>• Device initialized: {device ? 'Yes' : 'No'}</li>
        <li>• Device state: {device ? device.state : 'N/A'}</li>
        <li>• Call active: {call ? 'Yes' : 'No'}</li>
        <li>• Current status: {callStatus.status}</li>
      </ul>
    </div>
  );
};
