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
  return (
    <>
      <CommandEmpty>
        {loading ? (
          "Loading..."
        ) : error ? (
          "Error loading contacts."
        ) : (
          "No contact found."
        )}
      </CommandEmpty>
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