
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type CallStatus = 'initiated' | 'connecting' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled';

export function useCallStatus(callId?: string) {
  const [status, setStatus] = useState<CallStatus>('initiated');

  useEffect(() => {
    if (!callId) return;

    // Subscribe to changes in the call status
    const channel = supabase
      .channel('call_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls',
          filter: `id=eq.${callId}`,
        },
        (payload) => {
          if (payload.new && 'status' in payload.new) {
            setStatus(payload.new.status as CallStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callId]);

  return { status, setStatus };
}
