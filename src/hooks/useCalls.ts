import { useState } from "react";

export interface Call {
  id: string;
  contact_id: string;
  duration: number;
  notes: string;
  created_at: string;
}

export function useCalls() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);

  return { calls, loading };
} 