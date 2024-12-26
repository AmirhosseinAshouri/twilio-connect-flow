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
  company: string;
  value: number;
  probability: number;
  stage: string;
  user_id: string;
  assigned_to?: string;
  contact_id?: string;
  created_at: string;
  updated_at: string;
}

export type { DealStage } from './deals';

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

export interface Communication {
  id: string;
  contact_id: string;
  user_id: string;
  type: 'email' | 'sms' | 'call';
  direction: 'sent' | 'incoming';
  content: string;
  subject?: string;
  created_at: string;
  twilio_sid?: string;
}

export type ContactFormValues = Omit<Contact, 'id' | 'user_id' | 'created_at'>;
export type DealFormValues = Omit<Deal, 'id' | 'user_id' | 'created_at'>;
export type CallFormValues = Omit<Call, 'id' | 'user_id' | 'created_at'>;