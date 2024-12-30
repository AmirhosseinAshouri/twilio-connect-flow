import { useState } from "react";
import { PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSettings } from "@/hooks";
import { Contact } from "@/types";
import { CallForm } from "./CallForm";
import { useTwilioVoice } from "@/hooks/useTwilioVoice";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CallFormDialogProps {
  contact?: Contact;
  trigger?: React.ReactNode;
}

export function CallFormDialog({ contact, trigger }: CallFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(contact?.phone || "");
  const [notes, setNotes] = useState("");
  const { settings, loading: settingsLoading } = useSettings();
  const { makeCall, hangUp, isReady, isConnecting, hasActiveCall } = useTwilioVoice();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contact?.id) {
      toast({
        title: "Error",
        description: "Contact information is missing",
        variant: "destructive",
      });
      return;
    }

    if (!isReady) {
      toast({
        title: "Error",
        description: "Voice client not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await makeCall(phone);
      toast({
        title: "Call Initiated",
        description: "Connecting your call...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate call",
        variant: "destructive",
      });
    }
  };

  const handleSettingsClick = () => {
    setOpen(false);
    navigate("/settings");
  };

  const getMissingSettings = () => {
    if (!settings) return ["Twilio Account SID", "Twilio Auth Token", "Twilio Phone Number"];
    const missing = [];
    if (!settings.twilio_account_sid) missing.push("Twilio Account SID");
    if (!settings.twilio_auth_token) missing.push("Twilio Auth Token");
    if (!settings.twilio_phone_number) missing.push("Twilio Phone Number");
    return missing;
  };

  const missingSettings = getMissingSettings();
  const isTwilioConfigured = missingSettings.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <PhoneCall className="mr-2 h-4 w-4" /> {hasActiveCall ? 'End Call' : 'New Call'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Call{contact ? ` with ${contact.name}` : ''}</DialogTitle>
          <DialogDescription>
            Start a new browser-based call with this contact using Twilio Voice.
          </DialogDescription>
        </DialogHeader>

        {settingsLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : !isTwilioConfigured ? (
          <Alert variant="destructive">
            <AlertTitle>Missing Twilio Settings</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>The following Twilio settings need to be configured:</p>
              <ul className="list-disc pl-4">
                {missingSettings.map((setting) => (
                  <li key={setting}>{setting}</li>
                ))}
              </ul>
              <Button onClick={handleSettingsClick} variant="outline" className="mt-2">
                Configure Settings
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <CallForm
            phone={phone}
            notes={notes}
            isLoading={isConnecting}
            settings={settings}
            onPhoneChange={setPhone}
            onNotesChange={setNotes}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}