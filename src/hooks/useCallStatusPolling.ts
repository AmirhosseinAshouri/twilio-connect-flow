import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type CallStatus = 'initiated' | 'connecting' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled';

export function useCallStatusPolling(callId?: string, intervalMs = 2000) {
  const [status, setStatus] = useState<CallStatus>('initiated');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!callId) return;

    let pollInterval: NodeJS.Timeout;
    let isActive = true;

    const pollCallStatus = async () => {
      if (!isActive) return;
      
      try {
        const { data, error } = await supabase
          .from('calls')
          .select('status, twilio_sid')
          .eq('id', callId)
          .single();
        
        if (data && !error && isActive) {
          const currentStatus = data.status as CallStatus;
          console.log('Polled call status:', currentStatus);
          setStatus(currentStatus);
          
          // If call is in a final state, stop polling
          if (['completed', 'failed', 'canceled', 'busy', 'no-answer'].includes(currentStatus)) {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Error polling call status:', error);
      }
    };

    // Initial status fetch
    setLoading(true);
    pollCallStatus().finally(() => setLoading(false));

    // Start polling
    pollInterval = setInterval(pollCallStatus, intervalMs);

    return () => {
      isActive = false;
      clearInterval(pollInterval);
    };
  }, [callId, intervalMs]);

  return { status, setStatus, loading };
}