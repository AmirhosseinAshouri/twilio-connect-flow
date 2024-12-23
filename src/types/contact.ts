export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  user_id: string;
  created_at: string;
}

export type ContactFormValues = Omit<Contact, "id" | "user_id" | "created_at">; 