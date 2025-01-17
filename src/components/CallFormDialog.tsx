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

interface CallFormDialogProps {
  contact?: Contact;
  trigger?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CallFormDialog({ contact, trigger, variant, size }: CallFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(contact?.phone || "");
  const [notes, setNotes] = useState("");
  const { settings, loading: settingsLoading } = useSettings();
  const { initiateCall, isLoading } = useInitiateCall();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contact?.id) {
      console.error('Contact ID is required');
      return;
    }

    const success = await initiateCall({
      contact,
      phone,
      notes
    });
    
    if (success) {
      setOpen(false);
    }
  };

  const isTwilioConfigured = settings?.twilio_account_sid && 
                            settings?.twilio_auth_token && 
                            settings?.twilio_phone_number;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={variant} size={size}>
            <PhoneCall className="h-4 w-4" />
            {size !== "icon" && <span className="ml-2">Call</span>}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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
            <AlertTitle>Missing Twilio Settings</AlertTitle>
            <AlertDescription>
              Please configure your Twilio settings in the Settings page before making calls.
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