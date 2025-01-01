import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { ContactSelector } from "./ContactSelector";
import { Contact } from "@/types";

interface DealBasicInfoSectionProps {
  form: any;
  onContactSelect: (contact: Contact) => void;
}

export function DealBasicInfoSection({ form, onContactSelect }: DealBasicInfoSectionProps) {
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

      <ContactSelector form={form} onSelect={onContactSelect} />

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