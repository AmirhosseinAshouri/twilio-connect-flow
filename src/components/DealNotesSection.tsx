
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { format } from "date-fns";

interface Note {
  content: string;
  created_at: string;
  user_name?: string;
}

interface DealNotesSectionProps {
  form: any;
  notes?: Note[];
}

export function DealNotesSection({ form, notes = [] }: DealNotesSectionProps) {
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
            <FormControl>
              <Input
                type="datetime-local"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {notes.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="font-medium">Previous Notes</h3>
          <div className="space-y-4">
            {notes.map((note, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-muted"
              >
                <p className="whitespace-pre-wrap">{note.content}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {note.user_name ? `${note.user_name} - ` : ''}
                  {format(new Date(note.created_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
