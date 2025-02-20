import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Lead, Contact } from "@/types";
import { DealNotesSection } from "./DealNotesSection";
import { DealAssignedToSection } from "./DealAssignedToSection";
import { DealBasicInfoSection } from "./DealBasicInfoSection";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  notes: z.string().optional(),
  due_date: z.string().optional(),
  assigned_to: z.string().optional(),
  contact_id: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface LeadFormProps {
  lead: Lead;
  onSubmit: (values: Lead) => void;
}

interface Note {
  content: string;
  created_at: string;
  user_name?: string;
}

export function LeadForm({ lead, onSubmit }: LeadFormProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: lead.title || "",
      company: lead.company || "",
      notes: "",
      due_date: lead.due_date || "",
      assigned_to: lead.assigned_to || undefined,
      contact_id: lead.contact_id || "",
    },
  });

  useEffect(() => {
    const fetchNotes = async () => {
      const { data: notesData, error } = await supabase
        .from('deals')
        .select('notes, created_at')
        .eq('id', lead.id)
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
  }, [lead.id, toast]);

  const handleSubmit = async (values: FormValues) => {
    const updatedLead = {
      ...lead,
      title: values.title,
      company: values.company,
      contact_id: values.contact_id,
      assigned_to: values.assigned_to || null,
      due_date: values.due_date || null,
      notes: values.notes || lead.notes,
    };

    if (values.notes) {
      const mentionRegex = /@(\w+)/g;
      const mentions = values.notes.match(mentionRegex) || [];
      
      if (mentions.length > 0) {
        const mentionPromises = mentions.map(async (mention) => {
          const username = mention.slice(1);
          const { data: userData } = await supabase
            .from('profiles')
            .select('id')
            .eq('full_name', username)
            .single();

          if (userData) {
            await supabase.from('mentions').insert({
              lead_id: lead.id,
              user_id: (await supabase.auth.getUser()).data.user?.id,
              mentioned_user_id: userData.id,
            });
          }
        });

        await Promise.all(mentionPromises);
      }

      setNotes(prev => [{
        content: values.notes || "",
        created_at: new Date().toISOString(),
      }, ...prev]);

      form.setValue('notes', '');
    }

    onSubmit(updatedLead);
  };

  const handleContactSelect = (contact: Contact) => {
    if (contact) {
      form.setValue("company", contact.company || form.getValues("company"));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <DealBasicInfoSection 
          form={form} 
          onContactSelect={handleContactSelect} 
          isEditing={Boolean(lead.id)} 
        />
        <DealNotesSection form={form} notes={notes} />
        <DealAssignedToSection form={form} />
        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
