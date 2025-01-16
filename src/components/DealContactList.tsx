import { CommandEmpty, CommandGroup } from "./ui/command";
import { Contact } from "@/types";
import { DealContactListItem } from "./DealContactListItem";

interface DealContactListProps {
  contacts: Contact[];
  selectedContactId?: string;
  loading: boolean;
  error?: Error | null;
  onSelect: (contact: Contact) => void;
}

export function DealContactList({
  contacts,
  selectedContactId,
  loading,
  error,
  onSelect
}: DealContactListProps) {
  if (loading) {
    return (
      <CommandEmpty>Loading contacts...</CommandEmpty>
    );
  }

  if (error) {
    return (
      <CommandEmpty>Error loading contacts: {error.message}</CommandEmpty>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <CommandEmpty>No contacts found.</CommandEmpty>
    );
  }

  return (
    <>
      <CommandGroup>
        {contacts.map((contact) => (
          <DealContactListItem
            key={contact.id}
            contact={contact}
            isSelected={selectedContactId === contact.id}
            onSelect={onSelect}
          />
        ))}
      </CommandGroup>
    </>
  );
}