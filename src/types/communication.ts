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

export type CommunicationType = 'email' | 'sms' | 'call';
export type CommunicationDirection = 'sent' | 'incoming';

export interface Communication {
  id: string;
  contact_id: string;
  user_id: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  content: string;
  subject?: string;
  created_at: string;
  twilio_sid?: string;
}

export type CallFormValues = Omit<Call, 'id' | 'user_id' | 'created_at'>;