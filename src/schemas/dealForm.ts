
import * as z from "zod";

export const dealFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  stage: z.string(),
  notes: z.string().optional(),
  due_date: z.string().optional(),
  contact_id: z.string().min(1, "Contact is required"),
});

export type DealFormValues = z.infer<typeof dealFormSchema>;
