import { FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { DealNotesList } from "./DealNotesList";
import { MentionsInput } from "./MentionsInput";
import { Button } from "./ui/button";
import { Save } from "lucide-react";

interface DealNotesSectionProps {
  form: any;
  notes: any[];
}

export function DealNotesSection({ form, notes }: DealNotesSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Add Note</FormLabel>
            <MentionsInput
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Add a note... Use @ to mention users"
              className="min-h-[100px]"
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="submit" className="w-full flex items-center gap-2">
        <Save className="h-4 w-4" />
        Save Note
      </Button>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notes History</h3>
        <DealNotesList notes={notes} />
      </div>
    </div>
  );
}