
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact } from "@/types";
import { CallFormDialog } from "./CallFormDialog";
import { SendSMSDialog } from "./SendSMSDialog";
import { SendEmailDialog } from "./SendEmailDialog";
import { Phone, MessageSquare, Mail } from "lucide-react";

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  if (!contact) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{contact.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contact.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{contact.email}</span>
          </div>
        )}
        <div className="flex gap-2">
          <CallFormDialog 
            contact={contact} 
            trigger={
              <Button variant="custom" className="flex-1 bg-green-600 hover:bg-green-700 shadow-md font-medium">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            }
          />
          <SendSMSDialog 
            contact={contact} 
            trigger={
              <Button variant="custom" className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md font-medium">
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS
              </Button>
            }
          />
          <SendEmailDialog 
            contact={contact} 
            trigger={
              <Button variant="custom" className="flex-1 bg-purple-600 hover:bg-purple-700 shadow-md font-medium">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
