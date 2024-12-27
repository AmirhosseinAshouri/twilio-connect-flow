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
import { useInitiateCall } from "@/hooks/useInitiateCall";
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
  const { initiateCall, isLoading } = useInitiateCall();
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

    if (!settings?.twilio_phone_number || !settings?.twilio_account_sid || !settings?.twilio_auth_token) {
      toast({
        title: "Settings Required",
        description: "Please configure your Twilio settings in the Settings page",
        variant: "destructive",
      });
      setOpen(false);
      navigate("/settings");
      return;
    }

    const success = await initiateCall({
      contact,
      phone,
      notes
    });

    if (success) {
      setOpen(false);
      setPhone("");
      setNotes("");
      toast({
        title: "Success",
        description: "Call initiated successfully",
      });
    }
  };

  const handleSettingsClick = () => {
    setOpen(false);
    navigate("/settings");
  };

  const isTwilioConfigured = settings?.twilio_phone_number && 
                            settings?.twilio_account_sid && 
                            settings?.twilio_auth_token;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <PhoneCall className="mr-2 h-4 w-4" /> New Call
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Call{contact ? ` with ${contact.name}` : ''}</DialogTitle>
          <DialogDescription>
            Start a new call with this contact using Twilio.
          </DialogDescription>
        </DialogHeader>

        {settingsLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : !isTwilioConfigured ? (
          <Alert variant="destructive">
            <AlertTitle>Twilio Settings Required</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>Please configure your Twilio settings before making calls. You need to set up:</p>
              <ul className="list-disc pl-4">
                <li>Twilio Account SID</li>
                <li>Twilio Auth Token</li>
                <li>Twilio Phone Number</li>
              </ul>
              <Button onClick={handleSettingsClick} variant="outline" className="mt-2">
                Go to Settings
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <CallForm
            phone={phone}
            notes={notes}
            isLoading={isLoading}
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