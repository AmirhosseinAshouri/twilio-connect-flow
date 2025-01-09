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
import { FormControl, FormItem, FormLabel, FormMessage } from "./ui/form";
import { UseFormReturn } from "react-hook-form";
import { DealFormValues } from "@/schemas/dealForm";

interface DealContactSelectorProps {
  form: UseFormReturn<DealFormValues>;
}

export function DealContactSelector({ form }: DealContactSelectorProps) {
  const [open, setOpen] = useState(false);
  const { contacts = [], loading, error } = useContacts();
  
  const selectedContactId = form.watch("contact_id");
  const selectedContact = contacts?.find(
    (contact) => contact.id === selectedContactId
  );

  if (error) {
    return (
      <FormItem>
        <FormLabel>Contact</FormLabel>
        <FormControl>
          <Button
            variant="outline"
            className="w-full text-destructive"
            disabled
          >
            Error loading contacts
          </Button>
        </FormControl>
        <FormMessage>{error.message}</FormMessage>
      </FormItem>
    );
  }

  return (
    <FormItem>
      <FormLabel>Contact</FormLabel>
      <FormControl>
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
                {contacts.map((contact) => (
                  <CommandItem
                    key={contact.id}
                    value={contact.id}
                    onSelect={() => {
                      form.setValue("contact_id", contact.id);
                      form.setValue("company", contact.company || "");
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
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}