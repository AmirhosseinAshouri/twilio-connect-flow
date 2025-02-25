export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calls: {
        Row: {
          contact_id: string | null
          created_at: string
          duration: number | null
          end_time: string | null
          id: string
          notes: string | null
          start_time: string | null
          status: string | null
          twilio_sid: string | null
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          status?: string | null
          twilio_sid?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          status?: string | null
          twilio_sid?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          contact_id: string
          content: string
          created_at: string
          direction: string
          id: string
          subject: string | null
          twilio_sid: string | null
          type: string
          user_id: string
        }
        Insert: {
          contact_id: string
          content: string
          created_at?: string
          direction: string
          id?: string
          subject?: string | null
          twilio_sid?: string | null
          type: string
          user_id: string
        }
        Update: {
          contact_id?: string
          content?: string
          created_at?: string
          direction?: string
          id?: string
          subject?: string | null
          twilio_sid?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          birth_date: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          job_title: string | null
          name: string
          notes: string | null
          phone: string | null
          timezone: string | null
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          job_title?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          timezone?: string | null
          user_id: string
        }
        Update: {
          birth_date?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          job_title?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          timezone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          assigned_to: string | null
          company: string
          contact_id: string
          created_at: string
          due_date: string | null
          id: string
          stage: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          company: string
          contact_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          stage?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          company?: string
          contact_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          stage?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentions: {
        Row: {
          created_at: string
          deal_id: string | null
          id: string
          mentioned_user_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deal_id?: string | null
          id?: string
          mentioned_user_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deal_id?: string | null
          id?: string
          mentioned_user_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          completed: boolean | null
          content: string
          created_at: string
          deal_id: string
          due_date: string | null
          id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          content: string
          created_at?: string
          deal_id: string
          due_date?: string | null
          id?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          content?: string
          created_at?: string
          deal_id?: string
          due_date?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          twilio_account_sid: string | null
          twilio_api_key: string | null
          twilio_api_secret: string | null
          twilio_auth_token: string | null
          twilio_phone_number: string | null
          twilio_twiml_app_sid: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          twilio_account_sid?: string | null
          twilio_api_key?: string | null
          twilio_api_secret?: string | null
          twilio_auth_token?: string | null
          twilio_phone_number?: string | null
          twilio_twiml_app_sid?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          twilio_account_sid?: string | null
          twilio_api_key?: string | null
          twilio_api_secret?: string | null
          twilio_auth_token?: string | null
          twilio_phone_number?: string | null
          twilio_twiml_app_sid?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
