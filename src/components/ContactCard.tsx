import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact } from "@/types";
import { CallFormDialog } from "./CallFormDialog";
import { SendSMSDialog } from "./SendSMSDialog";
import { SendEmailDialog } from "./SendEmailDialog";

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
        {contact.phone && <p>{contact.phone}</p>}
        {contact.email && <p>{contact.email}</p>}
        <div className="flex gap-2">
          <CallFormDialog contact={contact} />
          <SendSMSDialog contact={contact} />
          <SendEmailDialog contact={contact} />
        </div>
      </CardContent>
    </Card>
  );
}