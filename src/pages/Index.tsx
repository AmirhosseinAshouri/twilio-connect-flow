import { Users, DollarSign, PhoneCall } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import { useToast } from "@/hooks/use-toast";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ContactsGrid } from "@/components/dashboard/ContactsGrid";
import { AddContactDialog } from "@/components/dashboard/AddContactDialog";
import { ContactFormValues } from "@/components/ContactForm";

export default function Index() {
  const { contacts, loading, error, addContact } = useContacts();
  const { toast } = useToast();

  const handleAddContact = async (values: ContactFormValues) => {
    try {
      const contactData = {
        name: values.name,
        company: values.company,
        email: values.email,
        phone: values.phone
      };
      const newContact = await addContact(contactData);
      if (newContact) {
        toast({
          title: "Success",
          description: "Contact added successfully",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading contacts: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <AddContactDialog onAddContact={handleAddContact} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Contacts"
            value={contacts?.length || 0}
            icon={Users}
          />
          <StatsCard
            title="Active Deals"
            value={8}
            icon={DollarSign}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Recent Calls"
            value={12}
            icon={PhoneCall}
            iconColor="text-blue-500"
          />
        </div>

        <ContactsGrid contacts={contacts} loading={loading} />
      </div>
    </div>
  );
}