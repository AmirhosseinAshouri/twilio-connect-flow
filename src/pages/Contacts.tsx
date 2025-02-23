
import { useState, useEffect } from "react";
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
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContactsTable } from "@/components/ContactsTable";
import { useContactColumns } from "@/hooks/useContactColumns";
import type { ContactWithLead } from "@/types/contact";

const Contacts = () => {
  const { contacts, loading, addContact, removeContact } = useContacts();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactsWithLeads, setContactsWithLeads] = useState<ContactWithLead[]>([]);
  const navigate = useNavigate();

  const handleRowClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  const handleRemoveContact = async (id: string) => {
    await removeContact(id);
  };

  const columns = useContactColumns({
    onRemove: handleRemoveContact,
    onRowClick: handleRowClick,
  });

  const filteredContacts = contactsWithLeads.filter(contact => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      (contact.email?.toLowerCase() || '').includes(searchLower) ||
      (contact.company?.toLowerCase() || '').includes(searchLower)
    );
  });

  useEffect(() => {
    const fetchLeadsForContacts = async () => {
      try {
        const { data: leads } = await supabase
          .from('deals')
          .select('contact_id, stage');

        const contactsWithLeadInfo: ContactWithLead[] = contacts.map(contact => ({
          ...contact,
          leadInfo: undefined
        }));

        leads?.forEach((lead) => {
          const contact = contactsWithLeadInfo.find(c => c.id === lead.contact_id);
          if (contact) {
            contact.leadInfo = { stage: lead.stage };
          }
        });

        setContactsWithLeads(contactsWithLeadInfo);
      } catch (error) {
        console.error('Error fetching leads:', error);
      }
    };

    if (contacts.length > 0) {
      fetchLeadsForContacts();
    } else {
      setContactsWithLeads([]);
    }
  }, [contacts]);

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
          <ContactsTable data={filteredContacts} columns={columns} />
        )}
      </div>
    </div>
  );
};

export default Contacts;
