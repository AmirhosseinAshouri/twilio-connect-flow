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
        console.log('Fetching settings...');
        setLoading(true);
        setError(null);
        
        // First check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) {
          console.error('Authentication error:', authError);
          throw authError;
        }
        if (!session) {
          console.error('No active session found');
          throw new Error("No active session");
        }

        console.log('User authenticated, fetching settings for user:', session.user.id);

        const { data, error: settingsError } = await supabase
          .from("settings")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (settingsError) {
          console.error('Settings fetch error:', settingsError);
          throw settingsError;
        }

        if (data) {
          console.log('Settings found:', {
            hasAccountSid: !!data.twilio_account_sid,
            hasAuthToken: !!data.twilio_auth_token,
            hasPhoneNumber: !!data.twilio_phone_number,
            hasTwimlAppSid: !!data.twilio_twiml_app_sid,
            hasApiSecret: !!data.twilio_api_secret,
            hasApiKey: !!data.twilio_api_key,
          });
          setSettings(data);
        } else {
          console.log('No settings found, creating default settings...');
          // No settings exist yet, create empty settings
          const { data: newSettings, error: insertError } = await supabase
            .from("settings")
            .insert([{ 
              user_id: session.user.id,
              twilio_account_sid: '',
              twilio_auth_token: '',
              twilio_phone_number: '',
              twilio_twiml_app_sid: '',
              twilio_api_secret: '',
              twilio_api_key: ''
            }])
            .select()
            .single();

          if (insertError) {
            console.error('Settings creation error:', insertError);
            throw insertError;
          }
          console.log('Default settings created successfully');
          setSettings(newSettings);
        }
      } catch (err) {
        console.error('Error in fetchSettings:', err);
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
      console.log('Updating settings...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found during settings update');
        throw new Error("No active session");
      }

      console.log('Updating settings for user:', session.user.id);

      const { error } = await supabase
        .from("settings")
        .update(values)
        .eq("user_id", session.user.id);

      if (error) {
        console.error('Settings update error:', error);
        throw error;
      }

      console.log('Settings updated successfully');
      setSettings(values);
      toast.success("Settings updated successfully");
      return true;
    } catch (err) {
      console.error('Error in updateSettings:', err);
      toast.error("Failed to update settings. Please try again.");
      throw err;
    }
  };

  return { settings, loading, error, updateSettings };
}