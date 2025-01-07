import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContactSelector } from "./ContactSelector";
import { Contact } from "@/types";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  stage: z.string(),
  notes: z.string().optional(),
  contact_id: z.string().min(1, "Contact is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddDealFormProps {
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
}

export function AddDealForm({ onSubmit, onCancel }: AddDealFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      company: "",
      stage: "qualify",
      notes: "",
      contact_id: "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  const handleContactSelect = (contact: Contact) => {
    if (contact) {
      form.setValue("company", contact.company || "");
      form.setValue("contact_id", contact.id);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <ContactSelector form={form} onSelect={handleContactSelect} />
        
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
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add notes about this deal..."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stage</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a stage" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="qualify">Qualify</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Deal</Button>
        </div>
      </form>
    </Form>
  );
}