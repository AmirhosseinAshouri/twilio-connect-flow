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

        let { data, error } = await supabase
          .from("settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Settings don't exist yet, create them
          const { data: newSettings, error: insertError } = await supabase
            .from("settings")
            .insert([{ 
              user_id: user.id,
              twilio_account_sid: '',
              twilio_auth_token: '',
              twilio_phone_number: ''
            }])
            .select()
            .single();

          if (insertError) throw insertError;
          data = newSettings;
        } else if (error) {
          throw error;
        }

        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (values: TwilioSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("settings")
        .upsert([{ 
          ...values, 
          user_id: user.id 
        }]);

      if (error) throw error;

      setSettings(values);
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  return { settings, loading, error, updateSettings };
}