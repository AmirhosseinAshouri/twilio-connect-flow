import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { NewCallDialog } from "@/components/NewCallDialog";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  const [smsOpen, setSmsOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const { toast } = useToast();

  const handleSendSMS = async () => {
    try {
      const response = await supabase.functions.invoke('send-sms', {
        body: { to: contact.phone, message }
      });

      if (response.error) throw new Error(response.error.message);

      toast({
        title: "SMS Sent",
        description: "Message has been sent successfully.",
      });
      setSmsOpen(false);
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = async () => {
    try {
      const response = await supabase.functions.invoke('send-email', {
        body: { 
          to: contact.email,
          subject,
          html: message
        }
      });

      if (response.error) throw new Error(response.error.message);

      toast({
        title: "Email Sent",
        description: "Email has been sent successfully.",
      });
      setEmailOpen(false);
      setMessage("");
      setSubject("");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <Link to={`/contacts/${contact.id}`} className="hover:text-primary">
            {contact.name}
          </Link>
          <span className="text-sm font-normal text-muted-foreground">{contact.company}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{contact.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{contact.phone}</span>
          </div>
          <div className="flex gap-2 mt-4">
            <NewCallDialog 
              contact={contact}
              trigger={
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
              }
            />
            
            <Dialog open={smsOpen} onOpenChange={setSmsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS
                </Button>
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

            <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}