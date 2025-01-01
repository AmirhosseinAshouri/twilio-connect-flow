import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const USERS = [
  { id: "1", name: "Admin User" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "John Doe" },
] as const;

interface DealAssignedToSectionProps {
  form: any;
}

export function DealAssignedToSection({ form }: DealAssignedToSectionProps) {
  return (
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
  );
}