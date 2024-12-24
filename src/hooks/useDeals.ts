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

  const updateDeal = async (updatedDeal: Deal) => {
    try {
      const { error } = await supabase
        .from("deals")
        .update(updatedDeal)
        .eq("id", updatedDeal.id);

      if (error) throw error;

      setDeals((currentDeals) =>
        currentDeals.map((deal) =>
          deal.id === updatedDeal.id ? updatedDeal : deal
        )
      );

      toast({
        title: "Deal Updated",
        description: `${updatedDeal.title} has been updated successfully.`,
      });
    } catch (err) {
      toast({
        title: "Error updating deal",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  return { deals, loading, error, setDeals, updateDeal };
}