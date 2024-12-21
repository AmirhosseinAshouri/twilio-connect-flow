import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MessageSquare, ArrowLeft, Building2, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

// Mock data - in a real app, this would come from an API or database
const mockContacts: Contact[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "(555) 123-4567",
    company: "Acme Inc",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "(555) 987-6543",
    company: "Tech Corp",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "(555) 456-7890",
    company: "Global Solutions",
  },
];

export default function ContactDetail() {
  const { id } = useParams();
  const contact = mockContacts.find((c) => c.id === id);

  if (!contact) {
    return (
      <div className="p-8">
        <h1>Contact not found</h1>
        <Link to="/contacts" className="text-blue-500 hover:underline">
          Back to contacts
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link
            to="/contacts"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">{contact.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{contact.company}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{contact.phone}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Communication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send SMS
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>No recent activity</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}