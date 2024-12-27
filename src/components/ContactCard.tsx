import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact } from "@/types";
import { CallFormDialog } from "./CallFormDialog";

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{contact.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{contact.phone}</p>
        <p>{contact.email}</p>
        <CallFormDialog contact={contact} />
      </CardContent>
    </Card>
  );
}
