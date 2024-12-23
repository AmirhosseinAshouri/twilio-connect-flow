export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  user_id: string;
  created_at: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost';
  contact_id: string;
  user_id: string;
  created_at: string;
}

export interface Call {
  id: string;
  contact_id: string;
  user_id: string;
  duration: number;
  notes: string;
  created_at: string;
}

export type ContactFormValues = Omit<Contact, 'id' | 'user_id' | 'created_at'>;
export type DealFormValues = Omit<Deal, 'id' | 'user_id' | 'created_at'>;
export type CallFormValues = Omit<Call, 'id' | 'user_id' | 'created_at'>; 