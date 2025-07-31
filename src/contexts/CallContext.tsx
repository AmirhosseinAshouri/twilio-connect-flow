import React, { createContext, useContext, useState, useCallback } from 'react';
import { Contact } from '@/types';

interface CallState {
  isActive: boolean;
  callId?: string;
  contact?: Contact;
  phoneNumber?: string;
  status?: string;
}

interface CallContextType {
  callState: CallState;
  startCall: (callId: string, contact?: Contact, phoneNumber?: string) => void;
  endCall: () => void;
  updateCallStatus: (status: string) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [callState, setCallState] = useState<CallState>({
    isActive: false
  });

  const startCall = useCallback((callId: string, contact?: Contact, phoneNumber?: string) => {
    console.log('CallProvider: Starting call with ID:', callId);
    setCallState({
      isActive: true,
      callId,
      contact,
      phoneNumber,
      status: 'initiated'
    });
  }, []);

  const endCall = useCallback(() => {
    console.log('CallProvider: Ending call');
    setCallState({
      isActive: false
    });
  }, []);

  const updateCallStatus = useCallback((status: string) => {
    setCallState(prev => ({ ...prev, status }));
  }, []);

  return (
    <CallContext.Provider value={{ callState, startCall, endCall, updateCallStatus }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}