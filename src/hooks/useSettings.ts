import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TwilioSettings {
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_phone_number: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<TwilioSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings(data);
        } else {
          // No settings exist yet, create empty settings
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
          setSettings(newSettings);
        }
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
        .update(values)
        .eq("user_id", user.id);

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