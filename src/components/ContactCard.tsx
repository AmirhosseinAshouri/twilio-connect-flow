import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

interface ContactCardProps {
  contact: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
  };
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
            <Button variant="outline" size="sm" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              SMS
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}