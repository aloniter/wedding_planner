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
      weddings: {
        Row: {
          id: string
          bride_name: string
          groom_name: string
          wedding_date: string | null
          venue_name: string | null
          total_budget: number
          estimated_guests: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bride_name: string
          groom_name: string
          wedding_date?: string | null
          venue_name?: string | null
          total_budget?: number
          estimated_guests?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bride_name?: string
          groom_name?: string
          wedding_date?: string | null
          venue_name?: string | null
          total_budget?: number
          estimated_guests?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          id: string
          wedding_id: string
          user_id: string
          role: string
          invited_email: string | null
          joined_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          user_id: string
          role?: string
          invited_email?: string | null
          joined_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          wedding_id?: string
          user_id?: string
          role?: string
          invited_email?: string | null
          joined_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_members_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
        ]
      }
      guests: {
        Row: {
          id: string
          wedding_id: string
          full_name: string
          phone: string | null
          side: string
          group_name: string | null
          adults_count: number
          kids_count: number
          rsvp_status: string
          gift_amount: number | null
          table_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          full_name: string
          phone?: string | null
          side?: string
          group_name?: string | null
          adults_count?: number
          kids_count?: number
          rsvp_status?: string
          gift_amount?: number | null
          table_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wedding_id?: string
          full_name?: string
          phone?: string | null
          side?: string
          group_name?: string | null
          adults_count?: number
          kids_count?: number
          rsvp_status?: string
          gift_amount?: number | null
          table_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'guests_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'guests_table_id_fkey'
            columns: ['table_id']
            isOneToOne: false
            referencedRelation: 'wedding_tables'
            referencedColumns: ['id']
          },
        ]
      }
      vendors: {
        Row: {
          id: string
          wedding_id: string
          name: string
          category: string
          contact_phone: string | null
          total_price: number
          deposit_paid: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          name: string
          category: string
          contact_phone?: string | null
          total_price?: number
          deposit_paid?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wedding_id?: string
          name?: string
          category?: string
          contact_phone?: string | null
          total_price?: number
          deposit_paid?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'vendors_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
        ]
      }
      wedding_tables: {
        Row: {
          id: string
          wedding_id: string
          table_number: number
          label: string | null
          seat_capacity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          table_number: number
          label?: string | null
          seat_capacity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wedding_id?: string
          table_number?: number
          label?: string | null
          seat_capacity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'wedding_tables_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
        ]
      }
      guest_categories: {
        Row: {
          id: string
          wedding_id: string
          name: string
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wedding_id: string
          name: string
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wedding_id?: string
          name?: string
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'guest_categories_wedding_id_fkey'
            columns: ['wedding_id']
            isOneToOne: false
            referencedRelation: 'weddings'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_wedding_member: {
        Args: {
          p_wedding_id: string
        }
        Returns: boolean
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
