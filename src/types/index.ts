export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  user_id: string;
  created_at: string;
}

export { Deal, DealStage } from './deals';

export interface Call {
  id: string;
  contact_id: string;
  user_id: string;
  duration: number;
  notes: string;
  created_at: string;
  twilio_sid?: string;
  status?: string;
}

export type ContactFormValues = Omit<Contact, 'id' | 'user_id' | 'created_at'>;
export type DealFormValues = Omit<Deal, 'id' | 'user_id' | 'created_at'>;
export type CallFormValues = Omit<Call, 'id' | 'user_id' | 'created_at'>;