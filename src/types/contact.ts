
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title?: string;
  birth_date?: string;
  notes?: string;
  user_id: string;
  created_at: string;
  timezone: string;
}

export interface ContactWithLead extends Contact {
  leadInfo?: {
    stage: string;
  };
  note?: string;
}

export type ContactFormValues = Omit<Contact, 'id' | 'user_id' | 'created_at'>;
