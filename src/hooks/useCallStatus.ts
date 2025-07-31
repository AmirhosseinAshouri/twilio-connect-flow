
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCallStatusPolling } from './useCallStatusPolling';

type CallStatus = 'initiated' | 'connecting' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled';

export function useCallStatus(callId?: string) {
  const [status, setStatus] = useState<CallStatus>('initiated');
  const [loading, setLoading] = useState(false);
  
  // Use polling as fallback for status updates
  const { status: polledStatus } = useCallStatusPolling(callId);

  useEffect(() => {
    if (!callId) return;

    setLoading(true);

    // First fetch current status
    const fetchCurrentStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('calls')
          .select('status')
          .eq('id', callId)
          .single();
        
        if (data && !error) {
          setStatus(data.status as CallStatus);
          console.log('Current call status fetched:', data.status);
        }
      } catch (error) {
        console.error('Error fetching call status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentStatus();

    // Subscribe to real-time changes in the call status
    const channel = supabase
      .channel(`call_status_${callId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls',
          filter: `id=eq.${callId}`,
        },
        (payload) => {
          console.log('Call status update received:', payload);
          if (payload.new && 'status' in payload.new) {
            const newStatus = payload.new.status as CallStatus;
            console.log('Updating status from realtime:', newStatus);
            setStatus(newStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callId]);

  // Use polled status as fallback if realtime isn't working
  useEffect(() => {
    if (polledStatus !== status) {
      console.log('Using polled status as fallback:', polledStatus);
      setStatus(polledStatus);
    }
  }, [polledStatus, status]);

  return { status, setStatus, loading };
}
