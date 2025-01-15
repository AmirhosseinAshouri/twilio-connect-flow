import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form";
import { ChevronsUpDown, Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { Contact } from "@/types";
import { forwardRef } from "react";

interface ContactTriggerButtonProps {
  loading: boolean;
  selectedContact: Contact | undefined;
  onClick?: () => void;
}

export const ContactTriggerButton = forwardRef<
  HTMLButtonElement,
  ContactTriggerButtonProps
>(({ loading, selectedContact, onClick }, ref) => {
  return (
    <FormControl>
      <Button
        variant="outline"
        role="combobox"
        type="button"
        ref={ref}
        onClick={onClick}
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
        ) : selectedContact?.name ? (
          selectedContact.name
        ) : (
          "Select contact..."
        )}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </FormControl>
  );
});

ContactTriggerButton.displayName = "ContactTriggerButton";