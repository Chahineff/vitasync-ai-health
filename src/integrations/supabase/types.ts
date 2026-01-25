export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          energy_level: number | null
          id: string
          mood: string | null
          notes: string | null
          pain_areas: string[] | null
          sleep_quality: number | null
          stress_level: number | null
          supplement_feedback: Json | null
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          pain_areas?: string[] | null
          sleep_quality?: number | null
          stress_level?: number | null
          supplement_feedback?: Json | null
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          pain_areas?: string[] | null
          sleep_quality?: number | null
          stress_level?: number | null
          supplement_feedback?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplement_logs: {
        Row: {
          id: string
          taken: boolean | null
          taken_at: string
          tracking_id: string
        }
        Insert: {
          id?: string
          taken?: boolean | null
          taken_at?: string
          tracking_id: string
        }
        Update: {
          id?: string
          taken?: boolean | null
          taken_at?: string
          tracking_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplement_logs_tracking_id_fkey"
            columns: ["tracking_id"]
            isOneToOne: false
            referencedRelation: "supplement_tracking"
            referencedColumns: ["id"]
          },
        ]
      }
      supplement_tracking: {
        Row: {
          active: boolean | null
          created_at: string
          dosage: string | null
          id: string
          product_name: string
          recommended_by_ai: boolean | null
          shopify_product_id: string | null
          time_of_day: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          dosage?: string | null
          id?: string
          product_name: string
          recommended_by_ai?: boolean | null
          shopify_product_id?: string | null
          time_of_day?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          dosage?: string | null
          id?: string
          product_name?: string
          recommended_by_ai?: boolean | null
          shopify_product_id?: string | null
          time_of_day?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_health_profiles: {
        Row: {
          activity_level: string | null
          age_range: string | null
          allergies: string[] | null
          budget_range_max: number | null
          budget_range_min: number | null
          created_at: string
          current_issues: string[] | null
          diet_type: string | null
          energy_level: number | null
          health_goals: string[] | null
          id: string
          is_adult: boolean | null
          max_daily_intakes: string | null
          medical_conditions: string[] | null
          medications_notes: string | null
          monthly_budget: string | null
          onboarding_completed: boolean | null
          preferred_forms: string[] | null
          shipping_country: string | null
          sleep_hours: string | null
          sleep_quality: string | null
          sleep_quality_score: number | null
          sport_types: string[] | null
          stress_level: string | null
          supplements_experience: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_level?: string | null
          age_range?: string | null
          allergies?: string[] | null
          budget_range_max?: number | null
          budget_range_min?: number | null
          created_at?: string
          current_issues?: string[] | null
          diet_type?: string | null
          energy_level?: number | null
          health_goals?: string[] | null
          id?: string
          is_adult?: boolean | null
          max_daily_intakes?: string | null
          medical_conditions?: string[] | null
          medications_notes?: string | null
          monthly_budget?: string | null
          onboarding_completed?: boolean | null
          preferred_forms?: string[] | null
          shipping_country?: string | null
          sleep_hours?: string | null
          sleep_quality?: string | null
          sleep_quality_score?: number | null
          sport_types?: string[] | null
          stress_level?: string | null
          supplements_experience?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_level?: string | null
          age_range?: string | null
          allergies?: string[] | null
          budget_range_max?: number | null
          budget_range_min?: number | null
          created_at?: string
          current_issues?: string[] | null
          diet_type?: string | null
          energy_level?: number | null
          health_goals?: string[] | null
          id?: string
          is_adult?: boolean | null
          max_daily_intakes?: string | null
          medical_conditions?: string[] | null
          medications_notes?: string | null
          monthly_budget?: string | null
          onboarding_completed?: boolean | null
          preferred_forms?: string[] | null
          shipping_country?: string | null
          sleep_hours?: string | null
          sleep_quality?: string | null
          sleep_quality_score?: number | null
          sport_types?: string[] | null
          stress_level?: string | null
          supplements_experience?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
