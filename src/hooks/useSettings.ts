import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TwilioSettings {
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_phone_number: string;
  twilio_twiml_app_sid: string;
  twilio_api_secret: string;
  twilio_api_key: string;
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
        
        // First check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) throw authError;
        if (!session) {
          throw new Error("No active session");
        }

        const { data, error: settingsError } = await supabase
          .from("settings")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (settingsError) throw settingsError;

        if (data) {
          setSettings(data);
        } else {
          // No settings exist yet, create empty settings
          const { data: newSettings, error: insertError } = await supabase
            .from("settings")
            .insert([{ 
              user_id: session.user.id,
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
        toast.error("Failed to load settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (values: TwilioSettings) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const { error } = await supabase
        .from("settings")
        .update(values)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setSettings(values);
      toast.success("Settings updated successfully");
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      toast.error("Failed to update settings. Please try again.");
      throw err;
    }
  };

  return { settings, loading, error, updateSettings };
}