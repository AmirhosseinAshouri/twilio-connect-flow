
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { DealContactSelector } from "./DealContactSelector";
import { DealStageSelector } from "./DealStageSelector";
import { dealFormSchema, DealFormValues } from "@/schemas/dealForm";
import { Contact } from "@/types";

interface AddLeadFormProps {
  onSubmit: (values: DealFormValues) => void;
  onCancel: () => void;
}

export function AddLeadForm({ onSubmit, onCancel }: AddLeadFormProps) {
  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: "",
      company: "",
      stage: "qualify",
      notes: "",
      contact_id: "",
    },
  });

  const handleSubmit = (values: DealFormValues) => {
    onSubmit(values);
  };

  const handleContactSelect = (contact: Contact) => {
    if (contact.company) {
      form.setValue("company", contact.company);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="contact_id"
          render={() => (
            <DealContactSelector 
              form={form} 
              onContactSelect={handleContactSelect}
            />
          )}
        />

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
                <Input {...field} />
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
                  placeholder="Add notes about this lead..."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DealStageSelector form={form} />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Lead</Button>
        </div>
      </form>
    </Form>
  );
}
