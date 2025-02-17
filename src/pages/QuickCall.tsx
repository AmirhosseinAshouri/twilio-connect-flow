
import React, { useState } from "react";
import { useInitiateCall } from "@/hooks/useInitiateCall";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CallWindow } from "@/components/CallWindow";
import { PhoneCall } from "lucide-react";

const QuickCall = () => {
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [callWindowOpen, setCallWindowOpen] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string>();
  const { settings, loading: settingsLoading } = useSettings();
  const { initiateCall, isLoading, hangUp } = useInitiateCall();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { success, callId } = await initiateCall({
      phone,
      notes
    });

    if (success && callId) {
      setCallWindowOpen(true);
      setCurrentCallId(callId);
    }
  };

  const handleHangUp = async () => {
    if (currentCallId) {
      await hangUp(currentCallId);
      setCallWindowOpen(false);
      setCurrentCallId(undefined);
    }
  };

  const isTwilioConfigured = settings?.twilio_account_sid && 
                            settings?.twilio_auth_token && 
                            settings?.twilio_phone_number &&
                            settings?.twilio_twiml_app_sid;

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Quick Call</CardTitle>
        </CardHeader>
        <CardContent>
          {settingsLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : !isTwilioConfigured ? (
            <Alert variant="destructive">
              <AlertTitle>Missing Twilio Settings</AlertTitle>
              <AlertDescription>
                Please configure your Twilio settings in the Settings page before making calls.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Call notes..."
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !isTwilioConfigured}
                className="w-full flex items-center justify-center gap-2"
              >
                <PhoneCall className="h-4 w-4" />
                {isLoading ? "Initiating Call..." : "Start Call"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {currentCallId && (
        <CallWindow
          open={callWindowOpen}
          onClose={() => {
            setCallWindowOpen(false);
            setCurrentCallId(undefined);
          }}
          status="initiated"
          phoneNumber={phone}
          onHangUp={handleHangUp}
        />
      )}
    </div>
  );
};

export default QuickCall;
