import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PhoneCall } from "lucide-react";
import { useSettings } from "@/hooks";
import { Contact } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

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
    
    if (!settings?.twilio_phone_number || !settings?.twilio_account_sid || !settings?.twilio_auth_token) {
      toast({
        title: "Settings Required",
        description: "Please configure your Twilio settings in the Settings page first",
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
      if (!user) throw new Error("User not authenticated");

      // First create the call record
      const { data: callData, error: callError } = await supabase
        .from("calls")
        .insert({
          contact_id: contact.id,
          user_id: user.id,
          notes,
          status: 'initiated'
        })
        .select()
        .single();

      if (callError) throw callError;

      // Then initiate the call
      const response = await supabase.functions.invoke('create-call', {
        body: {
          callId: callData.id,
          to: phone,
          notes,
        }
      });

      if (response.error) {
        try {
          const errorBody = JSON.parse(response.error.body);
          if (errorBody.missingSettings) {
            toast({
              title: "Twilio Settings Required",
              description: "Please configure your Twilio settings in the Settings page first",
              variant: "destructive",
            });
            return;
          }
          throw new Error(errorBody.error || "Failed to initiate call");
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          throw new Error("Failed to initiate call");
        }
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
            disabled={isLoading || !settings?.twilio_phone_number || !settings?.twilio_account_sid || !settings?.twilio_auth_token}
          >
            {isLoading ? "Initiating Call..." : "Start Call"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}