import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PhoneCall } from "lucide-react";
import { useCalls, useSettings } from "@/hooks";
import { Contact } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface NewCallDialogProps {
  contact?: Contact;
  trigger?: React.ReactNode;
}

export function NewCallDialog({ contact, trigger }: NewCallDialogProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(contact?.phone || "");
  const [notes, setNotes] = useState("");
  const { createCall } = useCalls();
  const { settings } = useSettings();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings?.twilio_phone_number) {
      toast({
        title: "Error",
        description: "Please configure Twilio settings first",
        variant: "destructive",
      });
      return;
    }
    
    if (!contact?.id) {
      toast({
        title: "Error",
        description: "Contact information is missing",
        variant: "destructive",
      });
      return;
    }
    
    await createCall(contact.id, phone, notes);
    setOpen(false);
    setPhone("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <PhoneCall className="mr-2 h-4 w-4" /> New Call
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Call{contact ? ` with ${contact.name}` : ''}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Call notes..."
            />
          </div>
          <Button type="submit">Start Call</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 