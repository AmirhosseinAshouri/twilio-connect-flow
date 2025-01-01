import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Deal, Contact } from "@/types";
import { ContactSelector } from "./ContactSelector";
import { DealNotesList } from "./DealNotesList";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  notes: z.string().optional(),
  assigned_to: z.string().optional(),
  contact_id: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface DealFormProps {
  deal: Deal;
  onSubmit: (values: Deal) => void;
}

const USERS = [
  { id: "1", name: "Admin User" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "John Doe" },
] as const;

interface Note {
  content: string;
  created_at: string;
  user_name?: string;
}

export function DealForm({ deal, onSubmit }: DealFormProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: deal.title || "",
      company: deal.company || "",
      notes: "",
      assigned_to: deal.assigned_to || undefined,
      contact_id: deal.contact_id || "",
    },
  });

  useEffect(() => {
    const fetchNotes = async () => {
      const { data: notesData, error } = await supabase
        .from('deals')
        .select('notes, created_at')
        .eq('id', deal.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching notes",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (notesData && notesData[0]?.notes) {
        const notesList = notesData.map(note => ({
          content: note.notes || "",
          created_at: note.created_at,
        }));
        setNotes(notesList);
      }
    };

    fetchNotes();
  }, [deal.id, toast]);

  const handleSubmit = async (values: FormValues) => {
    // Process mentions in notes
    const mentionRegex = /@(\w+)/g;
    const mentions = values.notes?.match(mentionRegex) || [];
    
    // Create mentions records if any mentions found
    if (mentions.length > 0) {
      const mentionPromises = mentions.map(async (mention) => {
        const username = mention.slice(1); // Remove @ symbol
        const { data: userData } = await supabase
          .from('profiles')
          .select('id')
          .eq('full_name', username)
          .single();

        if (userData) {
          await supabase.from('mentions').insert({
            deal_id: deal.id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            mentioned_user_id: userData.id,
          });
        }
      });

      await Promise.all(mentionPromises);
    }

    // Update deal with new note
    if (values.notes) {
      const updatedDeal = {
        ...deal,
        ...values,
      };
      onSubmit(updatedDeal);

      // Add new note to the list
      setNotes(prev => [{
        content: values.notes || "",
        created_at: new Date().toISOString(),
      }, ...prev]);

      // Clear notes field after submission
      form.setValue('notes', '');
    }
  };

  const handleContactSelect = (contact: Contact) => {
    if (contact) {
      form.setValue("company", contact.company || form.getValues("company"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ContactSelector form={form} onSelect={handleContactSelect} />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add Note</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add a note... Use @ to mention users"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notes History</h3>
          <DealNotesList notes={notes} />
        </div>

        <FormField
          control={form.control}
          name="assigned_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned To</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {USERS.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Form>
  );
}