
export interface Note {
  id: string;
  deal_id: string;
  content: string;
  created_at: string;
  completed: boolean;
  user_id: string;
  due_date: string | null;
}
