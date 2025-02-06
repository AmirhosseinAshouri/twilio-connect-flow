import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContactForm, ContactFormValues } from "@/components/ContactForm";
import { Plus } from "lucide-react";
import { useState } from "react";

interface AddContactDialogProps {
  onAddContact: (values: ContactFormValues) => Promise<void>;
}

export function AddContactDialog({ onAddContact }: AddContactDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (values: ContactFormValues) => {
    await onAddContact(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Fill in the contact details below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-8rem)] px-6 pb-6">
          <ContactForm onSubmit={handleSubmit} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}