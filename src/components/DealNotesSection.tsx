
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";
import { Checkbox } from "./ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";

interface DealNotesSectionProps {
  form: any;
  dealId: string;
}

export function DealNotesSection({ form, dealId }: DealNotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching notes",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setNotes(data);
      }
    };

    fetchNotes();
  }, [dealId, toast]);

  const handleNoteCompletion = async (noteId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ completed })
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prev => prev.map(note =>
        note.id === noteId ? { ...note, completed } : note
      ));

      toast({
        title: completed ? "Note marked as completed" : "Note marked as incomplete",
        description: "The note status has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating note status",
        description: "There was an error updating the note status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Add Note</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Add a note..."
                className="min-h-[100px] resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="due_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Due Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formattedDate = format(date, "yyyy-MM-dd");
                      field.onChange(formattedDate);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {notes.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="font-medium">Previous Notes</h3>
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-lg bg-muted"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={note.completed}
                      onCheckedChange={(checked) => handleNoteCompletion(note.id, checked as boolean)}
                      className="rounded-full data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                    />
                    <span className={note.completed ? "line-through text-muted-foreground" : ""}>
                      {note.content}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {format(new Date(note.created_at), "PPP")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
