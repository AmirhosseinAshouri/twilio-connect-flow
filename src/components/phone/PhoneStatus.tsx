
import React from 'react';
import { AlertCircle, CheckCircle, Phone, PhoneOff, PhoneCall } from 'lucide-react';

interface CallStatus {
  status: 'idle' | 'ready' | 'calling' | 'inCall' | 'error';
  message?: string;
}

interface PhoneStatusProps {
  status: CallStatus;
}

export const PhoneStatus: React.FC<PhoneStatusProps> = ({ status }) => {
  const getStatusIcon = () => {
    switch (status.status) {
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'calling':
        return <PhoneCall className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'inCall':
        return <Phone className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <PhoneOff className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'ready':
        return 'bg-green-50 border-green-200';
      case 'calling':
        return 'bg-blue-50 border-blue-200';
      case 'inCall':
        return 'bg-green-100 border-green-300';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'ready':
        return 'Ready to make calls';
      case 'calling':
        return 'Calling...';
      case 'inCall':
        return 'In Call';
      case 'error':
        return status.message || 'Error';
      case 'idle':
        return 'Initializing phone system';
      default:
        return 'Not connected';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()} flex items-center gap-3`}>
      {getStatusIcon()}
      <div>
        <p className="text-sm font-medium">
          {getStatusText()}
        </p>
        {status.message && status.status !== 'error' && (
          <p className="text-xs text-gray-500">{status.message}</p>
        )}
      </div>
    </div>
  );
};
