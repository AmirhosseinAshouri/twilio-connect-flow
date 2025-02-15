
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
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CallWindow } from "./CallWindow";
import { useCallStatus } from "@/hooks/useCallStatus";

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
  const [callWindowOpen, setCallWindowOpen] = useState(false);
  const [currentCallId, setCurrentCallId] = useState<string>();
  const { settings, loading: settingsLoading } = useSettings();
  const { initiateCall, isLoading, hangUp } = useInitiateCall();
  const { status } = useCallStatus(currentCallId);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    const { success, callId } = await initiateCall({
      contact,
      phone,
      notes
    });
    
    if (success && callId) {
      setOpen(false);
      setCallWindowOpen(true);
      setCurrentCallId(callId);
    }
  };

  const handleHangUp = async () => {
    if (currentCallId) {
      await hangUp(currentCallId);
    }
  };

  const handleCallWindowClose = () => {
    setCallWindowOpen(false);
    setCurrentCallId(undefined);
    setPhone("");
    setNotes("");
  };

  const isTwilioConfigured = settings?.twilio_account_sid && 
                            settings?.twilio_auth_token && 
                            settings?.twilio_phone_number &&
                            settings?.twilio_twiml_app_sid;

  return (
    <>
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

      <CallWindow
        open={callWindowOpen}
        onClose={handleCallWindowClose}
        status={status}
        phoneNumber={phone}
        onHangUp={handleHangUp}
      />
    </>
  );
}
