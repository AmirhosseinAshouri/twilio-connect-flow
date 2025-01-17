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
import { Mail } from "lucide-react";
import { Contact } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SendEmailDialogProps {
  contact: Contact;
  trigger?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function SendEmailDialog({ contact, trigger, variant, size }: SendEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const { toast } = useToast();

  const handleSendEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error: dbError } = await supabase
        .from('communications')
        .insert({
          contact_id: contact.id,
          type: 'email' as const,
          direction: 'sent' as const,
          content: message,
          subject: subject,
          user_id: user.id
        });

      if (dbError) throw dbError;

      const response = await supabase.functions.invoke('send-email', {
        body: { 
          to: contact.email,
          subject,
          html: message
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Email Sent",
        description: "Email has been sent successfully.",
      });
      setOpen(false);
      setMessage("");
      setSubject("");
    } catch (error) {
      console.error('Email Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={variant} size={size}>
            <Mail className="h-4 w-4" />
            {size !== "icon" && <span className="ml-2">Email</span>}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Email to {contact.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Textarea
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-message">Message</Label>
            <Textarea
              id="email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
            />
          </div>
          <Button onClick={handleSendEmail}>Send Email</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}