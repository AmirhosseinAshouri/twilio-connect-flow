import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { Contact } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SendSMSDialogProps {
  contact: Contact;
  trigger?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function SendSMSDialog({ contact, trigger, variant, size }: SendSMSDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSendSMS = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error: dbError } = await supabase
        .from('communications')
        .insert({
          contact_id: contact.id,
          type: 'sms' as const,
          direction: 'sent' as const,
          content: message,
          user_id: user.id
        });

      if (dbError) throw dbError;

      const response = await supabase.functions.invoke('send-sms', {
        body: { to: contact.phone, message }
      });

      if (response.error) throw response.error;

      toast({
        title: "SMS Sent",
        description: "Message has been sent successfully.",
      });
      setOpen(false);
      setMessage("");
    } catch (error) {
      console.error('SMS Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send SMS",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={variant} size={size}>
            <MessageSquare className="h-4 w-4" />
            {size !== "icon" && <span className="ml-2">SMS</span>}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send SMS to {contact.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
            />
          </div>
          <Button onClick={handleSendSMS}>Send SMS</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}