import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Deal } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("deals")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setDeals(data || []);
      } catch (err) {
        setError(err as Error);
        toast({
          title: "Error fetching deals",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [toast]);

  return { deals, loading, error };
}