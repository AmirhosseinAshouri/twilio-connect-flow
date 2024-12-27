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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CallForm } from "./CallForm";
import { validateTwilioSettings, createCallRecord, initiateCall } from "@/utils/twilioUtils";

interface NewCallDialogProps {
  contact?: Contact;
  trigger?: React.ReactNode;
}

export function NewCallDialog({ contact, trigger }: NewCallDialogProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(contact?.phone || "");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { settings } = useSettings();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = await validateTwilioSettings(settings);
    if (!validation.isValid) {
      toast({
        title: "Settings Required",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    if (!contact?.id) {
      toast({
        title: "Error",
        description: "Contact information is missing",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        });
        return;
      }

      const callData = await createCallRecord(contact.id, user.id, notes);
      const response = await initiateCall(callData.id, phone, notes);

      if (response.error) {
        const errorMessage = response.error.message || "Failed to initiate call";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Call initiated successfully",
      });
      setOpen(false);
      setPhone("");
      setNotes("");
    } catch (error) {
      console.error('Call creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initiate call",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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