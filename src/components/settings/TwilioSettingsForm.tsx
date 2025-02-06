import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings, TwilioSettings } from "@/hooks/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ErrorState";
import { useToast } from "@/hooks/use-toast";

export function TwilioSettingsForm() {
  const { settings, loading, error, updateSettings } = useSettings();
  const { toast } = useToast();
  const [twilioConfig, setTwilioConfig] = useState<TwilioSettings>({
    twilio_account_sid: "",
    twilio_auth_token: "",
    twilio_phone_number: "",
    twilio_twiml_app_sid: "",
    twilio_api_secret: "",
    twilio_api_key: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      console.log('Loaded Twilio settings:', {
        hasAccountSid: !!settings.twilio_account_sid,
        hasAuthToken: !!settings.twilio_auth_token,
        hasPhoneNumber: !!settings.twilio_phone_number,
        hasTwimlAppSid: !!settings.twilio_twiml_app_sid,
        hasApiSecret: !!settings.twilio_api_secret,
        hasApiKey: !!settings.twilio_api_key,
      });
      
      setTwilioConfig({
        twilio_account_sid: settings.twilio_account_sid || "",
        twilio_auth_token: settings.twilio_auth_token || "",
        twilio_phone_number: settings.twilio_phone_number || "",
        twilio_twiml_app_sid: settings.twilio_twiml_app_sid || "",
        twilio_api_secret: settings.twilio_api_secret || "",
        twilio_api_key: settings.twilio_api_key || "",
      });
    }
  }, [settings]);

  const handleTwilioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      console.log('Attempting to save Twilio settings...');
      await updateSettings(twilioConfig);
      console.log('Twilio settings saved successfully');
      toast({
        title: "Settings saved",
        description: "Your Twilio settings have been updated successfully.",
      });
    } catch (err) {
      console.error('Error saving Twilio settings:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save Twilio settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Twilio Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Settings loading error:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Twilio Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState 
            message={error.message} 
            onRetry={() => window.location.reload()} 
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Twilio Integration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTwilioSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="account-sid">Account SID</Label>
            <Input
              id="account-sid"
              value={twilioConfig.twilio_account_sid}
              onChange={(e) => setTwilioConfig({
                ...twilioConfig,
                twilio_account_sid: e.target.value
              })}
              placeholder="Enter your Twilio Account SID"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-token">Auth Token</Label>
            <Input
              id="auth-token"
              type="password"
              value={twilioConfig.twilio_auth_token}
              onChange={(e) => setTwilioConfig({
                ...twilioConfig,
                twilio_auth_token: e.target.value
              })}
              placeholder="Enter your Twilio Auth Token"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone-number">Twilio Phone Number</Label>
            <Input
              id="phone-number"
              value={twilioConfig.twilio_phone_number}
              onChange={(e) => setTwilioConfig({
                ...twilioConfig,
                twilio_phone_number: e.target.value
              })}
              placeholder="Enter your Twilio Phone Number (e.g., +1234567890)"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twiml-app-sid">TwiML App SID</Label>
            <Input
              id="twiml-app-sid"
              value={twilioConfig.twilio_twiml_app_sid}
              onChange={(e) => setTwilioConfig({
                ...twilioConfig,
                twilio_twiml_app_sid: e.target.value
              })}
              placeholder="Enter your TwiML App SID"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              value={twilioConfig.twilio_api_key}
              onChange={(e) => setTwilioConfig({
                ...twilioConfig,
                twilio_api_key: e.target.value
              })}
              placeholder="Enter your Twilio API Key"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-secret">API Secret</Label>
            <Input
              id="api-secret"
              type="password"
              value={twilioConfig.twilio_api_secret}
              onChange={(e) => setTwilioConfig({
                ...twilioConfig,
                twilio_api_secret: e.target.value
              })}
              placeholder="Enter your Twilio API Secret"
              required
            />
          </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Twilio Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}