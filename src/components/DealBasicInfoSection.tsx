import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { DealContactSelector } from "./DealContactSelector";
import { Contact } from "@/types";

interface DealBasicInfoSectionProps {
  form: any;
  onContactSelect: (contact: Contact) => void;
  isEditing?: boolean;
}

export function DealBasicInfoSection({ form, onContactSelect, isEditing = false }: DealBasicInfoSectionProps) {
  return (
    <>
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

      {isEditing ? (
        <FormField
          control={form.control}
          name="contact_id"
          render={() => (
            <FormItem>
              <FormLabel>Contact</FormLabel>
              <FormControl>
                <Input 
                  value={form.getValues("company")} 
                  disabled 
                  className="bg-muted"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <DealContactSelector form={form} onSelect={onContactSelect} />
      )}

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
    </>
  );
}