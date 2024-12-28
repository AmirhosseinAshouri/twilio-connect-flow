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
    twilio_account_sid: settings?.twilio_account_sid || "",
    twilio_auth_token: settings?.twilio_auth_token || "",
    twilio_phone_number: settings?.twilio_phone_number || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setTwilioConfig(settings);
    }
  }, [settings]);

  const handleTwilioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(twilioConfig);
      toast({
        title: "Settings saved",
        description: "Your Twilio settings have been updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save Twilio settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Twilio Integration</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        ) : error ? (
          <ErrorState 
            message={error.message} 
            onRetry={() => window.location.reload()} 
          />
        ) : (
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
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Twilio Settings"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}