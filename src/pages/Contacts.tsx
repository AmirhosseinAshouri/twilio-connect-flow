
import { useState } from "react";
import { useContacts } from "@/hooks/useContacts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ContactForm, ContactFormValues } from "@/components/ContactForm";
import { Plus, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CallFormDialog } from "@/components/CallFormDialog";
import { SendSMSDialog } from "@/components/SendSMSDialog";
import { SendEmailDialog } from "@/components/SendEmailDialog";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const Contacts = () => {
  const { contacts, loading, addContact, removeContact } = useContacts();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      (contact.email?.toLowerCase() || '').includes(searchLower) ||
      (contact.company?.toLowerCase() || '').includes(searchLower)
    );
  });

  const handleAddContact = async (values: ContactFormValues) => {
    const contactData = {
      name: values.name || '',
      company: values.company || '',
      email: values.email || '',
      phone: values.phone || '',
      timezone: values.timezone || 'UTC'
    };
    const newContact = await addContact(contactData);
    if (newContact) {
      setOpen(false);
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  const handleRemoveContact = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await removeContact(id);
  };

  const getCurrentTime = (timezone: string) => {
    try {
      return formatInTimeZone(new Date(), timezone || 'UTC', 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid timezone';
    }
  };

  return (
    <div className="p-4 md:p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Contacts</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Company</TableHead>
                  <TableHead>Local Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow 
                    key={contact.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(contact.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{contact.name}</span>
                        <span className="text-sm text-muted-foreground sm:hidden">
                          {contact.email}
                        </span>
                        <span className="text-sm text-muted-foreground md:hidden">
                          {contact.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{contact.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{contact.phone}</TableCell>
                    <TableCell className="hidden lg:table-cell">{contact.company}</TableCell>
                    <TableCell>{getCurrentTime(contact.timezone)}</TableCell>
                    <TableCell>
                      <div 
                        className="flex justify-end gap-1 sm:gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CallFormDialog contact={contact} variant="ghost" size="icon" />
                        <SendSMSDialog contact={contact} variant="ghost" size="icon" />
                        <SendEmailDialog contact={contact} variant="ghost" size="icon" />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleRemoveContact(e, contact.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
