import { Check } from "lucide-react";
import { CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Contact } from "@/types";

interface ContactListItemProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: (contact: Contact) => void;
}

export function ContactListItem({ contact, isSelected, onSelect }: ContactListItemProps) {
  return (
    <CommandItem
      key={contact.id}
      value={contact.id}
      onSelect={() => {
        onSelect(contact);
      }}
      className="cursor-pointer"
    >
      <Check
        className={cn(
          "mr-2 h-4 w-4",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      {contact.name}
    </CommandItem>
  );
}