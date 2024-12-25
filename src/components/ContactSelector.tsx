import React from "react";
import { UseFormReturn } from "react-hook-form";
import { useContacts } from "@/hooks";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

export interface Contact {
  id: string;
  name: string;
  company: string;
}

interface ContactSelectorProps {
  form: UseFormReturn<any>;
  onSelect: (contact: Contact) => void;
}

export function ContactSelector({ form, onSelect }: ContactSelectorProps) {
  const { contacts, loading, error } = useContacts();
  const validContacts = contacts || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive p-4">
        Error loading contacts. Please try again.
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name="contactId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Contact</FormLabel>
          <FormControl>
            <Command className="border rounded-md">
              <CommandInput placeholder="Search contacts..." />
              <CommandEmpty>No contacts found.</CommandEmpty>
              <CommandGroup className="max-h-40 overflow-auto">
                {validContacts.map((contact) => (
                  <CommandItem
                    key={contact.id}
                    value={contact.id}
                    onSelect={() => {
                      field.onChange(contact.id);
                      onSelect(contact);
                    }}
                  >
                    <div>
                      <div>{contact.name}</div>
                      {contact.company && (
                        <div className="text-sm text-muted-foreground">
                          {contact.company}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}