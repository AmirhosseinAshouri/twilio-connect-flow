import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Deal, DealStage } from "@/types/deals";
import { useNavigate } from "react-router-dom";

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/signin");
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    const fetchDeals = async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching deals",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        // Validate and cast the stage to DealStage
        const validDeals = data.map(deal => ({
          ...deal,
          stage: deal.stage as DealStage
        }));
        setDeals(validDeals);
      }
    };

    fetchDeals();

    // Subscribe to changes
    const dealsSubscription = supabase
      .channel("deals_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, fetchDeals)
      .subscribe();

    return () => {
      dealsSubscription.unsubscribe();
    };
  }, [toast]);

  const updateDeal = async (updatedDeal: Deal) => {
    const { error } = await supabase
      .from("deals")
      .update(updatedDeal)
      .eq("id", updatedDeal.id);

    if (error) {
      toast({
        title: "Error updating deal",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setDeals(deals.map((d) => (d.id === updatedDeal.id ? updatedDeal : d)));
    toast({
      title: "Deal Updated",
      description: `${updatedDeal.title} has been updated successfully.`,
    });
  };

  return { deals, updateDeal };
}