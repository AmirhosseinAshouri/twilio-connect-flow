import { useState, useEffect } from "react";
import { FormControl } from "./ui/form";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandGroup, CommandItem, CommandInput, CommandEmpty } from "./ui/command";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  full_name: string;
}

interface MentionsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MentionsInput({ value, onChange, placeholder, className }: MentionsInputProps) {
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
          id: user.id,
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
      
      onChange(newText);
      setShowMentions(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <Popover 
      open={showMentions && filteredUsers.length > 0} 
      onOpenChange={setShowMentions}
    >
      <PopoverTrigger asChild>
        <FormControl>
          <Textarea 
            placeholder={placeholder || "Use @ to mention users"}
            className={className}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyUp={handleKeyUp}
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
  );
}