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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      cases: {
        Row: {
          ai_analysis: string | null
          ai_analyzed_at: string | null
          case_number: string | null
          case_type: string | null
          client_id: string
          client_role: string | null
          court: string | null
          created_at: string
          description: string | null
          id: string
          lawyer_id: string
          next_session: string | null
          opponent: string | null
          status: string
          title: string
        }
        Insert: {
          ai_analysis?: string | null
          ai_analyzed_at?: string | null
          case_number?: string | null
          case_type?: string | null
          client_id: string
          client_role?: string | null
          court?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lawyer_id?: string
          next_session?: string | null
          opponent?: string | null
          status?: string
          title: string
        }
        Update: {
          ai_analysis?: string | null
          ai_analyzed_at?: string | null
          case_number?: string | null
          case_type?: string | null
          client_id?: string
          client_role?: string | null
          court?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lawyer_id?: string
          next_session?: string | null
          opponent?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          lawyer_id: string
          mother_name: string | null
          national_id: string | null
          notes: string | null
          occupation: string | null
          phone: string | null
          photo_path: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          lawyer_id?: string
          mother_name?: string | null
          national_id?: string | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          photo_path?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          lawyer_id?: string
          mother_name?: string | null
          national_id?: string | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          photo_path?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          case_id: string | null
          client_id: string
          created_at: string
          description: string | null
          id: string
          lawyer_id: string
          mime: string | null
          name: string
          path: string
          section: string
          size: number | null
        }
        Insert: {
          case_id?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          lawyer_id?: string
          mime?: string | null
          name: string
          path: string
          section?: string
          size?: number | null
        }
        Update: {
          case_id?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          lawyer_id?: string
          mime?: string | null
          name?: string
          path?: string
          section?: string
          size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      fees: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          entry_date: string
          id: string
          kind: string
          lawyer_id: string
          note: string | null
        }
        Insert: {
          amount?: number
          client_id: string
          created_at?: string
          entry_date?: string
          id?: string
          kind?: string
          lawyer_id?: string
          note?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          entry_date?: string
          id?: string
          kind?: string
          lawyer_id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fees_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      hearings: {
        Row: {
          case_id: string
          created_at: string
          hearing_date: string
          id: string
          lawyer_id: string
          note: string | null
          outcome: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          hearing_date: string
          id?: string
          lawyer_id?: string
          note?: string | null
          outcome?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          hearing_date?: string
          id?: string
          lawyer_id?: string
          note?: string | null
          outcome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hearings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      law_articles: {
        Row: {
          article_number: string
          content: string
          created_at: string
          id: string
          law_key: string
        }
        Insert: {
          article_number: string
          content: string
          created_at?: string
          id?: string
          law_key: string
        }
        Update: {
          article_number?: string
          content?: string
          created_at?: string
          id?: string
          law_key?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          case_id: string | null
          client_id: string
          content: string
          created_at: string
          done: boolean
          id: string
          is_task: boolean
          lawyer_id: string
        }
        Insert: {
          case_id?: string | null
          client_id: string
          content: string
          created_at?: string
          done?: boolean
          id?: string
          is_task?: boolean
          lawyer_id?: string
        }
        Update: {
          case_id?: string | null
          client_id?: string
          content?: string
          created_at?: string
          done?: boolean
          id?: string
          is_task?: boolean
          lawyer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          full_name: string
          id: string
          username: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          full_name?: string
          id: string
          username: string
        }
        Update: {
          active?: boolean
          created_at?: string
          full_name?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "lawyer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "lawyer"],
    },
  },
} as const
