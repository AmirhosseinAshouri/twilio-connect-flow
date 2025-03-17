
import React from 'react';

interface CallStatus {
  status: 'idle' | 'ready' | 'calling' | 'inCall' | 'error';
  message?: string;
}

interface PhoneStatusProps {
  status: CallStatus;
}

export const PhoneStatus: React.FC<PhoneStatusProps> = ({ status }) => {
  return (
    <div className="p-4 rounded-lg bg-secondary">
      <p className="text-sm font-medium">
        Status: {status.status}
        {status.message && ` - ${status.message}`}
      </p>
    </div>
  );
};
