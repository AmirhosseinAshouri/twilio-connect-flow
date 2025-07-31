import { useCall } from '@/contexts/CallContext';
import { MobileCallWindow } from './MobileCallWindow';
import { useInitiateCall } from '@/hooks/useInitiateCall';
import { useCallStatus } from '@/hooks/useCallStatus';
import { toast } from 'sonner';

type CallStatus = 'initiated' | 'connecting' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled';

export function GlobalCallWindow() {
  const { callState, endCall, updateCallStatus } = useCall();
  const { hangUp } = useInitiateCall();
  const { status } = useCallStatus(callState.callId);

  // Update call status when it changes
  if (status && status !== callState.status) {
    updateCallStatus(status);
  }

  const handleHangUp = async () => {
    if (callState.callId) {
      await hangUp(callState.callId);
      toast.info("Call ended");
    }
    endCall();
  };

  const handleClose = () => {
    console.log("GlobalCallWindow: Closing call window");
    endCall();
  };

  return (
    <MobileCallWindow
      open={callState.isActive}
      onClose={handleClose}
      status={(status || callState.status || 'initiated') as CallStatus}
      phoneNumber={callState.phoneNumber || ''}
      contactName={callState.contact?.name}
      onHangUp={handleHangUp}
    />
  );
}