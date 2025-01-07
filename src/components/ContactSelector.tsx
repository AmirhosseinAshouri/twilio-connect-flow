import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useContacts } from "@/hooks";
import { FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { UseFormReturn } from "react-hook-form";
import { Contact } from "@/types";
import { ContactListItem } from "./ContactListItem";
import { ContactTriggerButton } from "./ContactTriggerButton";

interface ContactSelectorProps {
  form: UseFormReturn<any>;
  onSelect: (contact: Contact) => void;
}

export function ContactSelector({ form, onSelect }: ContactSelectorProps) {
  const [open, setOpen] = useState(false);
  const { contacts, loading } = useContacts();
  const value = form.watch("contact_id");

  // Initialize contacts list as an empty array if undefined
  const contactsList = contacts || [];
  const selectedContact = contactsList.find((contact) => contact.id === value);

  const handleSelect = (contact: Contact) => {
    form.setValue("contact_id", contact.id);
    onSelect(contact);
    setOpen(false);
  };

  return (
    <FormField
      control={form.control}
      name="contact_id"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Contact</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <ContactTriggerButton
                loading={loading}
                selectedContact={selectedContact}
                onClick={() => setOpen(!open)}
              />
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search contacts..." />
                <CommandGroup>
                  {contactsList.length === 0 ? (
                    <CommandEmpty>No contacts found.</CommandEmpty>
                  ) : (
                    contactsList.map((contact) => (
                      <ContactListItem
                        key={contact.id}
                        contact={contact}
                        isSelected={value === contact.id}
                        onSelect={handleSelect}
                      />
                    ))
                  )}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}