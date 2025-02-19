
import React, { useState, useEffect } from "react";
import { useInitiateCall } from "@/hooks/useInitiateCall";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CallWindow } from "@/components/CallWindow";
import { PhoneCall, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QuickCall = () => {
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [callWindowOpen, setCallWindowOpen] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string>();
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
  const { settings, loading: settingsLoading } = useSettings();
  const { initiateCall, isLoading, hangUp } = useInitiateCall();
  const { toast } = useToast();

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasMicrophonePermission(true);
      } catch (error) {
        console.error('Microphone permission error:', error);
        setHasMicrophonePermission(false);
        toast({
          title: "Microphone Access Required",
          description: "Please enable microphone access to make calls.",
          variant: "destructive",
        });
      }
    };

    checkMicrophonePermission();
  }, [toast]);

  const handleRequestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasMicrophonePermission(true);
      toast({
        title: "Microphone Access Granted",
        description: "You can now make calls.",
      });
    } catch (error) {
      console.error('Failed to get microphone permission:', error);
      toast({
        title: "Access Denied",
        description: "Microphone access is required for making calls.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasMicrophonePermission) {
      toast({
        title: "Microphone Required",
        description: "Please enable microphone access before making a call.",
        variant: "destructive",
      });
      return;
    }

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
          ) : hasMicrophonePermission === false ? (
            <Alert variant="destructive">
              <AlertTitle>Microphone Access Required</AlertTitle>
              <AlertDescription className="space-y-4">
                <p>Please enable microphone access to make calls.</p>
                <Button onClick={handleRequestMicrophoneAccess} className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Enable Microphone
                </Button>
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
                disabled={isLoading || !isTwilioConfigured || !hasMicrophonePermission}
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
