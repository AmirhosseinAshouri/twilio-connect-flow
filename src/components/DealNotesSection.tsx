import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { DealNotesList } from "./DealNotesList";
import { useState, useEffect } from "react";
import { Command, CommandGroup, CommandItem, CommandInput, CommandEmpty } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  full_name: string | null;
}

interface DealNotesSectionProps {
  form: any;
  notes: any[];
}

export function DealNotesSection({ form, notes }: DealNotesSectionProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [textareaElement, setTextareaElement] = useState<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name');
      if (data) {
        const validUsers = data.map(user => ({
          ...user,
          full_name: user.full_name || 'Unnamed User'
        }));
        setUsers(validUsers);
      }
    };
    fetchUsers();
  }, []);

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1);
      if (!textAfterAt.includes(' ')) {
        setMentionFilter(textAfterAt);
        setShowMentions(true);
        setTextareaElement(textarea);
        return;
      }
    }
    setShowMentions(false);
  };

  const handleSelectUser = (username: string) => {
    if (textareaElement) {
      const cursorPosition = textareaElement.selectionStart;
      const textBeforeCursor = textareaElement.value.substring(0, cursorPosition);
      const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
      const textAfterCursor = textareaElement.value.substring(cursorPosition);
      
      const newText = textBeforeCursor.substring(0, lastAtSymbol) + 
        '@' + username + ' ' + textAfterCursor;
      
      form.setValue('notes', newText);
      setShowMentions(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <>
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Add Note</FormLabel>
            <Popover open={showMentions && filteredUsers.length > 0} onOpenChange={setShowMentions}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Textarea 
                    placeholder="Add a note... Use @ to mention users"
                    className="min-h-[100px]"
                    onKeyUp={handleKeyUp}
                    {...field} 
                  />
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup>
                    {filteredUsers.map((user) => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => handleSelectUser(user.full_name)}
                      >
                        {user.full_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notes History</h3>
        <DealNotesList notes={notes} />
      </div>
    </>
  );
}