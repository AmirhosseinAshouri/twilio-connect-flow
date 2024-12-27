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

interface CallFormDialogProps {
  contact?: Contact;
  trigger?: React.ReactNode;
}

export function CallFormDialog({ contact, trigger }: CallFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(contact?.phone || "");
  const [notes, setNotes] = useState("");
  const { settings } = useSettings();
  const { initiateCall, isLoading } = useInitiateCall();
  const { toast } = useToast();

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
        description: "Please configure your Twilio settings in the Settings page first",
        variant: "destructive",
      });
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
    }
  };

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
        {(!settings?.twilio_phone_number || !settings?.twilio_account_sid || !settings?.twilio_auth_token) && (
          <Alert variant="destructive">
            <AlertTitle>Twilio Settings Required</AlertTitle>
            <AlertDescription>
              Please configure your Twilio settings in the Settings page before making calls. You need to set up:
              <ul className="list-disc pl-4 mt-2">
                <li>Twilio Account SID</li>
                <li>Twilio Auth Token</li>
                <li>Twilio Phone Number</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <CallForm
          phone={phone}
          notes={notes}
          isLoading={isLoading}
          settings={settings}
          onPhoneChange={setPhone}
          onNotesChange={setNotes}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}