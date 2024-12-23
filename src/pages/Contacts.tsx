import { Button } from "@/components/ui/button";
import { ContactCard } from "@/components/ContactCard";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

const Contacts = () => {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleAddContact = (values: ContactFormValues) => {
    const newContact = {
      id: (contacts.length + 1).toString(),
      name: values.name,
      email: values.email,
      phone: values.phone,
      company: values.company,
    };
    setContacts([...contacts, newContact]);
    setOpen(false);
    toast({
      title: "Contact added",
      description: `${values.name} has been added to your contacts.`,
    });
  };

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Contacts</h1>
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

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      </div>
    </div>
  );
};

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

export default Contacts;