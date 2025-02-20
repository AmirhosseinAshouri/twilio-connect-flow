
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("deals")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setLeads(data as Lead[]);
      } catch (err) {
        setError(err as Error);
        toast({
          title: "Error fetching leads",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [toast]);

  const updateLead = async (updatedLead: Lead) => {
    try {
      const { error } = await supabase
        .from("deals")
        .update(updatedLead)
        .eq("id", updatedLead.id);

      if (error) throw error;

      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === updatedLead.id ? updatedLead : lead
        )
      );

      toast({
        title: "Lead Updated",
        description: `${updatedLead.title} has been updated successfully.`,
      });
    } catch (err) {
      toast({
        title: "Error updating lead",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  return { leads, loading, error, setLeads, updateLead };
}
