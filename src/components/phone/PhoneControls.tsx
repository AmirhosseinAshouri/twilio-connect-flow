
import React from 'react';

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
      <input
        type="tel"
        placeholder="Enter phone number (e.g. +15551234567)"
        value={toNumber}
        onChange={(e) => onToNumberChange(e.target.value)}
        className="w-full p-2 border rounded-md"
        disabled={callInProgress}
      />
      <div className="flex gap-4">
        <button 
          onClick={onCall}
          disabled={disabled || !toNumber}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {disabled && !callInProgress ? 'Connecting...' : 'Call'}
        </button>
        <button 
          onClick={onHangUp}
          disabled={!callInProgress}
          className="flex-1 px-4 py-2 bg-destructive text-white rounded-md hover:bg-destructive/90 disabled:opacity-50"
        >
          Hang Up
        </button>
      </div>
    </div>
  );
};
