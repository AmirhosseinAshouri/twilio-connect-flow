export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
