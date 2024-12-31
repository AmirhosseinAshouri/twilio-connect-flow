export type DealStage = "qualify" | "cold" | "warm" | "hot";

export interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  probability: number;
  stage: DealStage;
  user_id: string;
  assigned_to?: string;
  contact_id: string;
  created_at: string;
  updated_at: string;
}