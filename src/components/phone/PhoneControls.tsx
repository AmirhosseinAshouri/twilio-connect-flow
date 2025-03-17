
import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';

interface PhoneControlsProps {
  toNumber: string;
  onToNumberChange: (value: string) => void;
  onCall: () => void;
  onHangUp: () => void;
  disabled: boolean;
  callInProgress: boolean;
}

export const PhoneControls: React.FC<PhoneControlsProps> = ({
  toNumber,
  onToNumberChange,
  onCall,
  onHangUp,
  disabled,
  callInProgress
}) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="tel"
          placeholder="Enter phone number (e.g. +15551234567)"
          value={toNumber}
          onChange={(e) => onToNumberChange(e.target.value)}
          className="w-full p-2 border rounded-md pl-10"
          disabled={callInProgress}
        />
        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={onCall}
          disabled={disabled || !toNumber}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Phone className="h-4 w-4" />
          {disabled && !callInProgress ? 'Connecting...' : 'Call'}
        </button>
        <button 
          onClick={onHangUp}
          disabled={!callInProgress}
          className="flex-1 px-4 py-2 bg-destructive text-white rounded-md hover:bg-destructive/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <PhoneOff className="h-4 w-4" />
          Hang Up
        </button>
      </div>
      
      {callInProgress && (
        <div className="mt-2 text-center text-sm font-medium text-primary animate-pulse">
          Call in progress...
        </div>
      )}
    </div>
  );
};
