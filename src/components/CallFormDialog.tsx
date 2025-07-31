
import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { useCall } from "@/contexts/CallContext";

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
  const { startCall } = useCall();
  const navigate = useNavigate();

  // Add dialog-specific ID for debugging multiple instances
  const dialogId = `dialog-${contact?.id || 'new'}-${Math.random().toString(36).substr(2, 9)}`;

  // Only log from the open dialog to reduce noise
  useEffect(() => {
    if (open) {
      console.log(`CallFormDialog ${dialogId}: Dialog opened for contact:`, contact?.name, 'phone:', phone);
    }
  }, [open, dialogId, contact?.name, phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }

    try {
      console.log(`CallFormDialog ${dialogId}: About to initiate call with params:`, { contact, phone, notes });
      
      const result = await initiateCall({
        contact,
        phone,
        notes
      });
      
      console.log(`CallFormDialog ${dialogId}: Received result from initiateCall:`, result);
      console.log(`CallFormDialog ${dialogId}: Result structure:`, JSON.stringify(result, null, 2));
      
      if (result.success && result.callId) {
        console.log(`CallFormDialog ${dialogId}: Call successful, setting callId:`, result.callId);
        toast.success("Call initiated successfully");
        setOpen(false);
        
        // Use global call state instead of local state
        startCall(result.callId, contact, phone);
        console.log("Call initiated, using global call state with ID:", result.callId);
      } else {
        console.error(`CallFormDialog ${dialogId}: Call failed or no callId:`, result);
        toast.error("Failed to initiate call");
      }
    } catch (error) {
      console.error("Error initiating call:", error);
      toast.error("Error initiating call");
    }
  };

  const isTwilioConfigured = settings?.twilio_account_sid && 
                            settings?.twilio_auth_token && 
                            settings?.twilio_phone_number &&
                            settings?.twilio_twiml_app_sid;

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
