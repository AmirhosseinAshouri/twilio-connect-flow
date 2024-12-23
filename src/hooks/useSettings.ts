import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TwilioSettings {
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_phone_number: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<TwilioSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        setSettings(data);
      } catch (err) {
        setError(err as Error);
        toast({
          title: "Error fetching settings",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const updateSettings = async (values: TwilioSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("settings")
        .upsert([{ ...values, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setSettings(values);
      toast({
        title: "Settings Updated",
        description: "Your Twilio settings have been saved.",
      });
    } catch (err) {
      toast({
        title: "Error updating settings",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  return { settings, loading, error, updateSettings };
} 