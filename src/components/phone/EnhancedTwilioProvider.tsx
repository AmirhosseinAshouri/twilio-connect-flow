import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Enhanced call status with more states
interface CallStatus {
  status: 'idle' | 'initializing' | 'ready' | 'ringing' | 'connecting' | 'connected' | 'disconnected' | 'error';
  message?: string;
  callSid?: string;
  duration?: number;
}

// Enhanced device context with modern features
interface EnhancedTwilioContextProps {
  device: Device | null;
  call: Call | null;
  callStatus: CallStatus;
  isInitializing: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  audioQuality: 'poor' | 'fair' | 'good' | 'excellent' | null;
  initializeDevice: () => Promise<void>;
  makeCall: (toNumber: string, options?: CallOptions) => Promise<void>;
  answerCall: () => Promise<void>;
  rejectCall: () => void;
  hangUp: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  sendDTMF: (digit: string) => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  isMuted: boolean;
  isOnHold: boolean;
  incomingCall: Call | null;
}

interface CallOptions {
  enableRecording?: boolean;
  enableTranscription?: boolean;
  contactId?: string;
  notes?: string;
}

const EnhancedTwilioContext = createContext<EnhancedTwilioContextProps | undefined>(undefined);

export const useEnhancedTwilio = () => {
  const context = useContext(EnhancedTwilioContext);
  if (!context) {
    throw new Error('useEnhancedTwilio must be used within an EnhancedTwilioProvider');
  }
  return context;
};

interface EnhancedTwilioProviderProps {
  children: React.ReactNode;
}

export const EnhancedTwilioProvider: React.FC<EnhancedTwilioProviderProps> = ({ children }) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>({ status: 'idle' });
  const [isInitializing, setIsInitializing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioQuality, setAudioQuality] = useState<'poor' | 'fair' | 'good' | 'excellent' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { toast: toastHook } = useToast();

  // Enhanced audio quality monitoring (simplified for compatibility)
  const monitorAudioQuality = useCallback((currentCall: Call) => {
    const monitorInterval = setInterval(() => {
      if (currentCall) {
        // Simple quality monitoring based on call state
        try {
          const isConnected = currentCall.status() === 'open';
          const quality: 'poor' | 'fair' | 'good' | 'excellent' = isConnected ? 'good' : 'fair';
          setAudioQuality(quality);
        } catch (error) {
          console.warn('Audio quality monitoring error:', error);
          setAudioQuality('fair');
        }
      }
    }, 2000);

    return monitorInterval;
  }, []);

  // Enhanced device setup with modern features
  const setupDeviceListeners = useCallback((twilioDevice: Device) => {
    console.log('Setting up enhanced device listeners...');

    twilioDevice.on('registered', () => {
      console.log('Device registered successfully');
      setCallStatus({ status: 'ready' });
      toastHook({
        title: "Phone Ready",
        description: "Your phone system is ready for calls",
      });
    });

    twilioDevice.on('registrationFailed', (error: any) => {
      console.error('Device registration failed:', error);
      setCallStatus({ status: 'error', message: 'Registration failed' });
      toastHook({
        title: "Registration Failed",
        description: error.message || 'Failed to register device',
        variant: "destructive",
      });
    });

    twilioDevice.on('error', (error: any) => {
      console.error('Device error:', error);
      setCallStatus({ status: 'error', message: error.message });
      toastHook({
        title: "Device Error",
        description: error.message || 'Device error occurred',
        variant: "destructive",
      });
    });

    // Enhanced incoming call handling
    twilioDevice.on('incoming', (incomingCall: Call) => {
      console.log('Incoming call received:', {
        from: incomingCall.parameters.From,
        to: incomingCall.parameters.To,
        callSid: incomingCall.parameters.CallSid
      });

      setIncomingCall(incomingCall);
      setCallStatus({ 
        status: 'ringing', 
        message: 'Incoming call',
        callSid: incomingCall.parameters.CallSid 
      });

      toastHook({
        title: "Incoming Call",
        description: `Call from ${incomingCall.parameters.From || 'Unknown'}`,
      });

      // Enhanced call event handlers
      setupCallEventHandlers(incomingCall);
    });

    twilioDevice.on('tokenWillExpire', async () => {
      console.log('Token will expire, refreshing...');
      try {
        const { data, error } = await supabase.functions.invoke('get-twilio-token');
        if (data?.token && !error) {
          twilioDevice.updateToken(data.token);
          console.log('Token refreshed successfully');
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    });

  }, [toastHook]);

  // Enhanced call event handlers
  const setupCallEventHandlers = useCallback((call: Call) => {
    call.on('accept', () => {
      console.log('Call accepted');
      setCallStatus({ status: 'connected', callSid: call.parameters?.CallSid });
      setStartTime(new Date());
      
      // Start audio quality monitoring
      const monitorId = monitorAudioQuality(call);
      
      // Store monitor ID for cleanup
      (call as any).__monitorId = monitorId;
      
      toastHook({
        title: "Call Connected",
        description: "You are now connected",
      });
    });

    call.on('disconnect', () => {
      console.log('Call disconnected');
      
      // Clean up monitoring
      if ((call as any).__monitorId) {
        clearInterval((call as any).__monitorId);
      }
      
      const duration = startTime ? Math.round((Date.now() - startTime.getTime()) / 1000) : 0;
      
      setCallStatus({ 
        status: 'disconnected', 
        duration,
        callSid: call.parameters?.CallSid 
      });
      setCall(null);
      setIncomingCall(null);
      setStartTime(null);
      setAudioQuality(null);
      setIsMuted(false);
      setIsOnHold(false);
      setIsRecording(false);
      
      toastHook({
        title: "Call Ended",
        description: duration > 0 ? `Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : "Call disconnected",
      });
    });

    call.on('cancel', () => {
      console.log('Call canceled');
      setIncomingCall(null);
      setCallStatus({ status: 'ready' });
      toastHook({
        title: "Call Canceled",
        description: "The incoming call was canceled",
      });
    });

    call.on('error', (error) => {
      console.error('Call error:', error);
      setCallStatus({ status: 'error', message: error.message });
      toastHook({
        title: "Call Error",
        description: error.message || 'Call error occurred',
        variant: "destructive",
      });
    });

    call.on('warning', (warning) => {
      console.warn('Call warning:', warning);
      toastHook({
        title: "Call Warning",
        description: warning.message || 'Connection quality issue detected',
        variant: "destructive",
      });
    });

    call.on('ringing', () => {
      console.log('Call is ringing');
      setCallStatus({ status: 'ringing', callSid: call.parameters?.CallSid });
    });

  }, [monitorAudioQuality, startTime, toastHook]);

  // Enhanced device initialization
  const initializeDevice = useCallback(async () => {
    try {
      setIsInitializing(true);
      setCallStatus({ status: 'initializing' });
      
      console.log("Requesting enhanced Twilio token...");
      
      const { data, error } = await supabase.functions.invoke('get-twilio-token');
      
      if (error) {
        console.error("Token error:", error);
        throw error;
      }
      
      if (!data || !data.token) {
        throw new Error("No token received from the server");
      }
      
      console.log("Token received, initializing enhanced device...");

      // Request microphone with enhanced constraints
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 48000, // Higher quality audio
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        stream.getTracks().forEach(track => track.stop());
        console.log("Enhanced microphone access granted");
      } catch (err) {
        console.error("Microphone access denied:", err);
        throw new Error("Microphone permission denied");
      }

      // Enhanced device options for better quality and reliability
      const twilioDevice = new Device(data.token, {
        // Enhanced codec preferences for better quality
        codecPreferences: ['opus' as any, 'pcmu' as any],
        // Use multiple edges for better connectivity
        edge: ['ashburn', 'sydney', 'dublin', 'singapore', 'ireland'],
        // Enhanced timeouts and settings
        maxCallSignalingTimeoutMs: 30000,
        allowIncomingWhileBusy: false,
        logLevel: 'warn' // Reduce noise in production
      });

      setupDeviceListeners(twilioDevice);
      
      console.log("Registering enhanced device...");
      await twilioDevice.register();
      
      setDevice(twilioDevice);
      console.log("Enhanced device initialized successfully");
      
    } catch (error) {
      console.error('Enhanced device initialization error:', error);
      setCallStatus({ status: 'error', message: 'Device initialization failed' });
      toastHook({
        title: "Initialization Failed",
        description: error instanceof Error ? error.message : "Failed to initialize phone",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  }, [setupDeviceListeners, toastHook]);

  // Enhanced call making with options
  const makeCall = useCallback(async (toNumber: string, options: CallOptions = {}) => {
    if (!device || !toNumber || callStatus.status !== 'ready') {
      console.log("Cannot make call:", { 
        deviceExists: !!device, 
        toNumber, 
        currentStatus: callStatus.status 
      });
      return;
    }

    try {
      console.log("Making enhanced call to:", toNumber, "with options:", options);
      setCallStatus({ status: 'connecting' });
      
      // Enhanced call parameters
      const params: any = {
        To: toNumber,
        From: 'browser-user'
      };
      
      // Add recording option
      if (options.enableRecording) {
        params.Record = 'true';
        params.RecordingChannels = 'dual';
        params.RecordingStatusCallback = `https://fbwxtooicqpqotherube.supabase.co/functions/v1/recording-status`;
      }

      // Add transcription option  
      if (options.enableTranscription) {
        params.Transcribe = 'true';
        params.TranscribeCallback = `https://fbwxtooicqpqotherube.supabase.co/functions/v1/transcription-callback`;
      }

      const outgoingCall = await device.connect({
        params,
        rtcConstraints: {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        }
      });
      
      console.log("Enhanced call created:", outgoingCall);
      setCall(outgoingCall);
      
      // Create call record with enhanced data
      if (options.contactId) {
        try {
          await supabase.from('calls').insert({
            contact_id: options.contactId,
            notes: options.notes || '',
            twilio_sid: outgoingCall.parameters?.CallSid,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });
        } catch (error) {
          console.warn('Failed to create call record:', error);
        }
      }
      
      setupCallEventHandlers(outgoingCall);
      
    } catch (error) {
      console.error('Error making enhanced call:', error);
      setCallStatus({ status: 'error', message: 'Failed to make call' });
      toastHook({
        title: "Call Failed",
        description: error instanceof Error ? error.message : "Failed to make call",
        variant: "destructive",
      });
    }
  }, [device, callStatus, setupCallEventHandlers, toastHook]);

  // Answer incoming call
  const answerCall = useCallback(async () => {
    if (incomingCall) {
      console.log('Answering incoming call...');
      try {
        await incomingCall.accept();
        setCall(incomingCall);
        setIncomingCall(null);
      } catch (error) {
        console.error('Error answering call:', error);
        toastHook({
          title: "Answer Failed",
          description: "Failed to answer incoming call",
          variant: "destructive",
        });
      }
    }
  }, [incomingCall, toastHook]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (incomingCall) {
      console.log('Rejecting incoming call...');
      incomingCall.reject();
      setIncomingCall(null);
      setCallStatus({ status: 'ready' });
    }
  }, [incomingCall]);

  // Enhanced hang up
  const hangUp = useCallback(() => {
    if (call) {
      console.log("Hanging up call");
      call.disconnect();
    } else if (incomingCall) {
      rejectCall();
    }
  }, [call, incomingCall, rejectCall]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (call) {
      if (isMuted) {
        (call as any).mute(false);
        setIsMuted(false);
        toastHook({ title: "Unmuted", description: "Microphone enabled" });
      } else {
        call.mute();
        setIsMuted(true);
        toastHook({ title: "Muted", description: "Microphone disabled" });
      }
    }
  }, [call, isMuted, toastHook]);

  // Toggle hold (if supported by SDK version)
  const toggleHold = useCallback(() => {
    if (call && typeof (call as any).hold === 'function') {
      if (isOnHold) {
        (call as any).unhold();
        setIsOnHold(false);
        toastHook({ title: "Call Resumed", description: "Call taken off hold" });
      } else {
        (call as any).hold();
        setIsOnHold(true);
        toastHook({ title: "Call On Hold", description: "Call placed on hold" });
      }
    }
  }, [call, isOnHold, toastHook]);

  // Send DTMF
  const sendDTMF = useCallback((digit: string) => {
    if (call && typeof call.sendDigits === 'function') {
      call.sendDigits(digit);
      console.log('DTMF sent:', digit);
    }
  }, [call]);

  // Start recording (if supported)
  const startRecording = useCallback(async () => {
    if (call && callStatus.status === 'connected') {
      try {
        // This would require backend implementation
        await supabase.functions.invoke('start-call-recording', {
          body: { callSid: call.parameters?.CallSid }
        });
        setIsRecording(true);
        toastHook({ title: "Recording Started", description: "Call recording has begun" });
      } catch (error) {
        console.error('Failed to start recording:', error);
        toastHook({
          title: "Recording Failed",
          description: "Failed to start call recording",
          variant: "destructive",
        });
      }
    }
  }, [call, callStatus, toastHook]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      toastHook({ title: "Recording Stopped", description: "Call recording has ended" });
    }
  }, [isRecording, toastHook]);

  // Initialize device on mount
  useEffect(() => {
    initializeDevice();
    
    return () => {
      if (device) {
        console.log("Destroying enhanced Twilio device on unmount");
        device.destroy();
      }
    };
  }, []);

  const value: EnhancedTwilioContextProps = {
    device,
    call,
    incomingCall,
    callStatus,
    isInitializing,
    isRecording,
    isTranscribing,
    audioQuality,
    isMuted,
    isOnHold,
    initializeDevice,
    makeCall,
    answerCall,
    rejectCall,
    hangUp,
    toggleMute,
    toggleHold,
    sendDTMF,
    startRecording,
    stopRecording
  };

  return (
    <EnhancedTwilioContext.Provider value={value}>
      {children}
    </EnhancedTwilioContext.Provider>
  );
};