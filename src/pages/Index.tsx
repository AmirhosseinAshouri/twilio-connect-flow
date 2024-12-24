import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactCard } from "@/components/ContactCard";
import { Plus, Users, DollarSign, PhoneCall } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactForm, ContactFormValues } from "@/components/ContactForm";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useContacts } from "@/hooks/useContacts";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { contacts, loading, addContact } = useContacts();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleAddContact = async (values: ContactFormValues) => {
    const contactData = {
      name: values.name || '',
      company: values.company || '',
      email: values.email || '',
      phone: values.phone || ''
    };
    const newContact = await addContact(contactData);
    if (newContact) {
      setOpen(false);
    }
  };

  return (
    <div className="p-8 bg-crm-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-crm-foreground">Dashboard</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <ContactForm onSubmit={handleAddContact} />
            </DialogContent>
          </Dialog>
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
              {loading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <p className="text-3xl font-bold">{contacts.length}</p>
              )}
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

        
        
      </div>
    </div>
  );
};

export default Index;