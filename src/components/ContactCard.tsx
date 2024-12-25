import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { NewCallDialog } from "@/components/NewCallDialog";
import { SendSMSDialog } from "@/components/SendSMSDialog";
import { SendEmailDialog } from "@/components/SendEmailDialog";
import { Contact } from "@/types";

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
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
            <SendSMSDialog contact={contact} />
            <SendEmailDialog contact={contact} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}