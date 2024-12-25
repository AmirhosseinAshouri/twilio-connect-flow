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

  // Initialize contacts as an empty array if undefined
  const validContacts = contacts || [];

  // Show loading state
  if (loading) {
    return (
      <FormItem>
        <FormLabel>Contact</FormLabel>
        <div className="flex items-center justify-center p-4 border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      </FormItem>
    );
  }

  // Show error state
  if (error) {
    return (
      <FormItem>
        <FormLabel>Contact</FormLabel>
        <div className="text-sm text-destructive p-4 border rounded-md">
          Error loading contacts. Please try again.
        </div>
      </FormItem>
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
              {validContacts.length > 0 ? (
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
              ) : (
                <div className="p-4 text-sm text-muted-foreground">
                  No contacts available.
                </div>
              )}
            </Command>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}