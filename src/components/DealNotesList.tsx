import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "./ui/scroll-area";
import { UserCircle } from "lucide-react";

interface Note {
  content: string;
  created_at: string;
  user_name?: string;
}

interface DealNotesListProps {
  notes: Note[];
}

export function DealNotesList({ notes }: DealNotesListProps) {
  return (
    <ScrollArea className="h-[200px] rounded-md border p-4">
      <div className="space-y-4">
        {notes.map((note, index) => (
          <div key={index} className="space-y-1">
            <div className="text-sm text-muted-foreground flex items-center justify-between">
              <span className="flex items-center">
                <UserCircle className="h-4 w-4 mr-1" />
                {note.user_name || "Unknown User"}
              </span>
              <span>
                {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm">{note.content}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}