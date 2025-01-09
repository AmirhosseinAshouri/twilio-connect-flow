import { Check } from "lucide-react";
import { CommandItem } from "./ui/command";
import { cn } from "@/lib/utils";
import { Contact } from "@/types";

interface DealContactListItemProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: (contact: Contact) => void;
}

export function DealContactListItem({ 
  contact, 
  isSelected, 
  onSelect 
}: DealContactListItemProps) {
  return (
    <CommandItem
      key={contact.id}
      value={contact.id}
      onSelect={() => onSelect(contact)}
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