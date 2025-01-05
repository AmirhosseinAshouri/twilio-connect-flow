import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form";
import { ChevronsUpDown, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { Contact } from "@/types";

interface ContactTriggerButtonProps {
  loading: boolean;
  selectedContact: Contact | undefined;
}

export function ContactTriggerButton({ loading, selectedContact }: ContactTriggerButtonProps) {
  return (
    <FormControl>
      <Button
        variant="outline"
        role="combobox"
        type="button"
        className={cn(
          "w-full justify-between",
          !selectedContact && "text-muted-foreground"
        )}
      >
        {loading ? (
          <div className="flex items-center">
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Loading contacts...
          </div>
        ) : selectedContact ? (
          selectedContact.name
        ) : (
          "Select contact..."
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </FormControl>
  );
}