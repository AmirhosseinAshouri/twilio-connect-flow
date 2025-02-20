
export type LeadStage = "qualify" | "cold" | "warm" | "hot";

export interface Lead {
  id: string;
  title: string;
  company: string;
  stage: LeadStage;
  user_id: string;
  assigned_to?: string;
  contact_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type LeadFormValues = Omit<Lead, 'id' | 'user_id' | 'created_at'>;

export interface Mention {
  id: string;
  lead_id: string;
  user_id: string;
  mentioned_user_id: string;
  created_at: string;
}
