export type DealStage = "qualify" | "cold" | "warm" | "hot";

export interface Deal {
  id: string;
  title: string;
  company: string;
  stage: DealStage;
  user_id: string;
  assigned_to?: string;
  contact_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type DealFormValues = Omit<Deal, 'id' | 'user_id' | 'created_at'>;

export interface Mention {
  id: string;
  deal_id: string;
  user_id: string;
  mentioned_user_id: string;
  created_at: string;
}