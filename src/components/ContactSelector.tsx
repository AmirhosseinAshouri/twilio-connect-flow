import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useContacts } from "@/hooks";
import { Contact } from "@/types";

interface ContactSelectorProps {
  form: any;
  onSelect?: (contact: Contact) => void;
}

export function ContactSelector({ form, onSelect }: ContactSelectorProps) {
  const [open, setOpen] = useState(false);
  const { contacts, loading, error } = useContacts();
  
  // Initialize contacts as an empty array if undefined
  const safeContacts = contacts ?? [];
  
  const selectedContactId = form.watch("contact_id");
  const selectedContact = safeContacts.find(
    (contact) => contact.id === selectedContactId
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedContact && "text-muted-foreground"
          )}
          disabled={loading}
          type="button"
        >
          {loading ? (
            "Loading contacts..."
          ) : selectedContact ? (
            selectedContact.name
          ) : (
            "Select contact..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search contacts..." />
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
            {safeContacts.map((contact) => (
              <CommandItem
                key={contact.id}
                value={contact.id}
                onSelect={() => {
                  form.setValue("contact_id", contact.id);
                  if (onSelect) {
                    onSelect(contact);
                  }
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedContactId === contact.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {contact.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}