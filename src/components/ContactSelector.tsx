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
import { FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { UseFormReturn } from "react-hook-form";
import { Contact } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactSelectorProps {
  form: UseFormReturn<any>;
  onSelect: (contact: Contact) => void;
}

export function ContactSelector({ form, onSelect }: ContactSelectorProps) {
  const [open, setOpen] = useState(false);
  const { contacts = [], loading } = useContacts();
  const value = form.watch("contact_id");

  const selectedContact = contacts.find((contact) => contact.id === value);

  return (
    <FormField
      control={form.control}
      name="contact_id"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Contact</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
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
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search contacts..." />
                <CommandGroup>
                  {loading && (
                    <CommandItem disabled>Loading contacts...</CommandItem>
                  )}
                  {!loading && contacts.length === 0 && (
                    <CommandItem disabled>No contacts found.</CommandItem>
                  )}
                  {!loading &&
                    contacts.length > 0 &&
                    contacts.map((contact) => (
                      <CommandItem
                        key={contact.id}
                        value={contact.id}
                        onSelect={() => {
                          form.setValue("contact_id", contact.id);
                          onSelect(contact);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === contact.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {contact.name}
                      </CommandItem>
                    ))}
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