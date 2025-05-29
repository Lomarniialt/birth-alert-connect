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
      activity_logs: {
        Row: {
          action: string
          details: string
          id: string
          patient_id: string | null
          timestamp: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          action: string
          details: string
          id?: string
          patient_id?: string | null
          timestamp?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          action?: string
          details?: string
          id?: string
          patient_id?: string | null
          timestamp?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_rooms: {
        Row: {
          assigned_nurse_id: string | null
          created_at: string | null
          current_patient_id: string | null
          id: string
          is_occupied: boolean | null
          name: string
        }
        Insert: {
          assigned_nurse_id?: string | null
          created_at?: string | null
          current_patient_id?: string | null
          id: string
          is_occupied?: boolean | null
          name: string
        }
        Update: {
          assigned_nurse_id?: string | null
          created_at?: string | null
          current_patient_id?: string | null
          id?: string
          is_occupied?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "labor_rooms_assigned_nurse_id_fkey"
            columns: ["assigned_nurse_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          assigned_nurse_id: string | null
          baby_gender: Database["public"]["Enums"]["baby_gender"] | null
          delivered_at: string | null
          delivery_date: string | null
          delivery_notes: string | null
          full_name: string
          id: string
          labor_room_id: string | null
          next_of_kin_name: string
          next_of_kin_phone: string
          registered_at: string | null
          registered_by: string
          status: Database["public"]["Enums"]["patient_status"] | null
        }
        Insert: {
          assigned_nurse_id?: string | null
          baby_gender?: Database["public"]["Enums"]["baby_gender"] | null
          delivered_at?: string | null
          delivery_date?: string | null
          delivery_notes?: string | null
          full_name: string
          id?: string
          labor_room_id?: string | null
          next_of_kin_name: string
          next_of_kin_phone: string
          registered_at?: string | null
          registered_by: string
          status?: Database["public"]["Enums"]["patient_status"] | null
        }
        Update: {
          assigned_nurse_id?: string | null
          baby_gender?: Database["public"]["Enums"]["baby_gender"] | null
          delivered_at?: string | null
          delivery_date?: string | null
          delivery_notes?: string | null
          full_name?: string
          id?: string
          labor_room_id?: string | null
          next_of_kin_name?: string
          next_of_kin_phone?: string
          registered_at?: string | null
          registered_by?: string
          status?: Database["public"]["Enums"]["patient_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_assigned_nurse_id_fkey"
            columns: ["assigned_nurse_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_labor_room_id_fkey"
            columns: ["labor_room_id"]
            isOneToOne: false
            referencedRelation: "labor_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          labor_room_id: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_active?: boolean | null
          labor_room_id?: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          labor_room_id?: string | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
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
      baby_gender: "male" | "female"
      patient_status: "registered" | "in_labor" | "delivered"
      user_role: "admin" | "front_desk" | "labor_nurse"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      baby_gender: ["male", "female"],
      patient_status: ["registered", "in_labor", "delivered"],
      user_role: ["admin", "front_desk", "labor_nurse"],
    },
  },
} as const
