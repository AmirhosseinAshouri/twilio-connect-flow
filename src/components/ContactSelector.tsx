import { Check, ChevronsUpDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

export type Contact = {
  id: string;
  name: string;
  company: string;
};

const contacts: Contact[] = [
  { id: "1", name: "John Doe", company: "Acme Inc" },
  { id: "2", name: "Jane Smith", company: "Tech Corp" },
  { id: "3", name: "Mike Johnson", company: "Global Solutions" },
];

interface ContactSelectorProps {
  form: UseFormReturn<any>;
  onSelect?: (contact: Contact) => void;
}

export function ContactSelector({ form, onSelect }: ContactSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedContact = contacts.find(
    (contact) => contact.id === form.watch("contactId")
  );

  return (
    <FormField
      control={form.control}
      name="contactId"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Contact</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedContact?.name ?? "Select contact..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search contacts..." />
                <CommandEmpty>No contact found.</CommandEmpty>
                <CommandGroup>
                  {contacts.map((contact) => (
                    <CommandItem
                      key={contact.id}
                      value={contact.id}
                      onSelect={() => {
                        form.setValue("contactId", contact.id);
                        if (onSelect) {
                          onSelect(contact);
                        }
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          field.value === contact.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{contact.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {contact.company}
                        </span>
                      </div>
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