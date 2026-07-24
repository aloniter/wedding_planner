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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      guest_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          wedding_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          wedding_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_categories_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          adults_count: number
          created_at: string
          full_name: string
          gift_amount: number | null
          group_name: string | null
          id: string
          invitation_sent_at: string | null
          kids_count: number
          notes: string | null
          phone: string | null
          rsvp_responded_at: string | null
          rsvp_status: string
          rsvp_token: string
          side: string
          table_id: string | null
          updated_at: string
          wedding_id: string
        }
        Insert: {
          adults_count?: number
          created_at?: string
          full_name: string
          gift_amount?: number | null
          group_name?: string | null
          id?: string
          invitation_sent_at?: string | null
          kids_count?: number
          notes?: string | null
          phone?: string | null
          rsvp_responded_at?: string | null
          rsvp_status?: string
          rsvp_token?: string
          side?: string
          table_id?: string | null
          updated_at?: string
          wedding_id: string
        }
        Update: {
          adults_count?: number
          created_at?: string
          full_name?: string
          gift_amount?: number | null
          group_name?: string | null
          id?: string
          invitation_sent_at?: string | null
          kids_count?: number
          notes?: string | null
          phone?: string | null
          rsvp_responded_at?: string | null
          rsvp_status?: string
          rsvp_token?: string
          side?: string
          table_id?: string | null
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "wedding_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guests_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          invited_email: string | null
          joined_at: string | null
          role: string
          user_id: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_email?: string | null
          joined_at?: string | null
          role?: string
          user_id?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_email?: string | null
          joined_at?: string | null
          role?: string
          user_id?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          category: string
          contact_phone: string | null
          created_at: string
          deposit_paid: number
          id: string
          name: string
          notes: string | null
          total_price: number
          updated_at: string
          wedding_id: string
        }
        Insert: {
          category: string
          contact_phone?: string | null
          created_at?: string
          deposit_paid?: number
          id?: string
          name: string
          notes?: string | null
          total_price?: number
          updated_at?: string
          wedding_id: string
        }
        Update: {
          category?: string
          contact_phone?: string | null
          created_at?: string
          deposit_paid?: number
          id?: string
          name?: string
          notes?: string | null
          total_price?: number
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          venue_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_attachments_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          available_dates: string | null
          capacity: number | null
          contact_name: string | null
          created_at: string
          id: string
          location: string | null
          minimum_spend: number | null
          name: string
          notes: string | null
          phone: string | null
          price_per_person: number | null
          rating: number | null
          status: string
          updated_at: string
          website: string | null
          wedding_id: string
        }
        Insert: {
          available_dates?: string | null
          capacity?: number | null
          contact_name?: string | null
          created_at?: string
          id?: string
          location?: string | null
          minimum_spend?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          price_per_person?: number | null
          rating?: number | null
          status?: string
          updated_at?: string
          website?: string | null
          wedding_id: string
        }
        Update: {
          available_dates?: string | null
          capacity?: number | null
          contact_name?: string | null
          created_at?: string
          id?: string
          location?: string | null
          minimum_spend?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          price_per_person?: number | null
          rating?: number | null
          status?: string
          updated_at?: string
          website?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_tables: {
        Row: {
          created_at: string
          id: string
          label: string | null
          seat_capacity: number
          table_number: number
          updated_at: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          seat_capacity?: number
          table_number: number
          updated_at?: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          seat_capacity?: number
          table_number?: number
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_tables_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      weddings: {
        Row: {
          bride_name: string
          created_at: string
          estimated_guests: number | null
          groom_name: string
          id: string
          invite_message_templates: Json
          save_the_date_image_url: string | null
          slug: string
          total_budget: number
          updated_at: string
          venue_name: string | null
          wedding_date: string | null
        }
        Insert: {
          bride_name: string
          created_at?: string
          estimated_guests?: number | null
          groom_name: string
          id?: string
          invite_message_templates?: Json
          save_the_date_image_url?: string | null
          slug: string
          total_budget?: number
          updated_at?: string
          venue_name?: string | null
          wedding_date?: string | null
        }
        Update: {
          bride_name?: string
          created_at?: string
          estimated_guests?: number | null
          groom_name?: string
          id?: string
          invite_message_templates?: Json
          save_the_date_image_url?: string | null
          slug?: string
          total_budget?: number
          updated_at?: string
          venue_name?: string | null
          wedding_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_wedding_members: {
        Args: { p_wedding_id: string }
        Returns: {
          email: string
          id: string
          invited_email: string
          joined_at: string
          role: string
          user_id: string
          wedding_id: string
        }[]
      }
      is_wedding_member: { Args: { p_wedding_id: string }; Returns: boolean }
      is_wedding_owner: { Args: { p_wedding_id: string }; Returns: boolean }
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
