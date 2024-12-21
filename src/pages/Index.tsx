import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactCard } from "@/components/ContactCard";
import { Plus, Users, DollarSign, PhoneCall } from "lucide-react";

const mockContacts = [
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
];

const Index = () => {
  return (
    <div className="p-8 bg-crm-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-crm-foreground">Dashboard</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Contact
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-crm-primary" />
                Total Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">24</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-green-500" />
                Active Deals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">8</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PhoneCall className="h-5 w-5 text-blue-500" />
                Recent Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockContacts.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;