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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      arrangement_services: {
        Row: {
          arrangement_id: string
          created_at: string
          id: string
          is_included: boolean
          is_optional: boolean
          order_index: number
          quantity: number
          service_id: string
          unit_price: number | null
        }
        Insert: {
          arrangement_id: string
          created_at?: string
          id?: string
          is_included?: boolean
          is_optional?: boolean
          order_index?: number
          quantity?: number
          service_id: string
          unit_price?: number | null
        }
        Update: {
          arrangement_id?: string
          created_at?: string
          id?: string
          is_included?: boolean
          is_optional?: boolean
          order_index?: number
          quantity?: number
          service_id?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "arrangement_services_arrangement_id_fkey"
            columns: ["arrangement_id"]
            isOneToOne: false
            referencedRelation: "arrangements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arrangement_services_arrangement_id_fkey"
            columns: ["arrangement_id"]
            isOneToOne: false
            referencedRelation: "arrangements_with_calculated_price"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arrangement_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arrangement_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services_with_family"
            referencedColumns: ["id"]
          },
        ]
      }
      arrangements: {
        Row: {
          base_price: number | null
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          label: string
          max_nights: number | null
          min_nights: number | null
          org_id: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          base_price?: number | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label: string
          max_nights?: number | null
          min_nights?: number | null
          org_id: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          base_price?: number | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          label?: string
          max_nights?: number | null
          min_nights?: number | null
          org_id?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      currencies: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          id: string
          is_base: boolean | null
          label: string
          org_id: string
          rate_to_base: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          id?: string
          is_base?: boolean | null
          label: string
          org_id: string
          rate_to_base?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          id?: string
          is_base?: boolean | null
          label?: string
          org_id?: string
          rate_to_base?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hotel_settings: {
        Row: {
          activation_code: string | null
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          currency: string | null
          description: string | null
          email: string | null
          id: string
          is_activated: boolean | null
          logo_url: string | null
          name: string
          org_id: string
          phone: string | null
          timezone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          activation_code?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_activated?: boolean | null
          logo_url?: string | null
          name: string
          org_id: string
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          activation_code?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_activated?: boolean | null
          logo_url?: string | null
          name?: string
          org_id?: string
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          active: boolean | null
          code: string
          commission_percent: number | null
          created_at: string | null
          id: string
          kind: string
          label: string
          org_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          commission_percent?: number | null
          created_at?: string | null
          id?: string
          kind: string
          label: string
          org_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          commission_percent?: number | null
          created_at?: string | null
          id?: string
          kind?: string
          label?: string
          org_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_terminals: {
        Row: {
          active: boolean | null
          created_at: string | null
          device_id: string | null
          id: string
          name: string
          org_id: string
          provider: string | null
          take_commission: boolean | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          name: string
          org_id: string
          provider?: string | null
          take_commission?: boolean | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          name?: string
          org_id?: string
          provider?: string | null
          take_commission?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          label: string
        }
        Insert: {
          category?: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          label: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      profile_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          profile_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_login_at: string | null
          org_id: string
          profile_id: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          org_id: string
          profile_id?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          org_id?: string
          profile_id?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          adults: number | null
          children: number | null
          date_arrival: string
          date_departure: string | null
          id: string
          org_id: string
          planned_time: string | null
          rate_total: number | null
          reference: string | null
          room_id: string | null
          status: string
        }
        Insert: {
          adults?: number | null
          children?: number | null
          date_arrival: string
          date_departure?: string | null
          id?: string
          org_id: string
          planned_time?: string | null
          rate_total?: number | null
          reference?: string | null
          room_id?: string | null
          status: string
        }
        Update: {
          adults?: number | null
          children?: number | null
          date_arrival?: string
          date_departure?: string | null
          id?: string
          org_id?: string
          planned_time?: string | null
          rate_total?: number | null
          reference?: string | null
          room_id?: string | null
          status?: string
        }
        Relationships: []
      }
      room_types: {
        Row: {
          capacity: number | null
          code: string
          created_at: string
          id: string
          label: string
          note: string | null
          org_id: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          code: string
          created_at?: string
          id?: string
          label: string
          note?: string | null
          org_id: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          code?: string
          created_at?: string
          id?: string
          label?: string
          note?: string | null
          org_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          created_at: string
          features: Json | null
          floor: string | null
          id: string
          is_fictive: boolean
          number: string
          org_id: string
          room_type_id: string | null
          status: string
          type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          features?: Json | null
          floor?: string | null
          id?: string
          is_fictive?: boolean
          number: string
          org_id: string
          room_type_id?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          features?: Json | null
          floor?: string | null
          id?: string
          is_fictive?: boolean
          number?: string
          org_id?: string
          room_type_id?: string | null
          status?: string
          type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_families: {
        Row: {
          code: string
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          label: string
          order_index: number
          org_id: string
          updated_at: string
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          label: string
          order_index?: number
          org_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          label?: string
          order_index?: number
          org_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          code: string
          cost_price: number | null
          created_at: string
          description: string | null
          family_id: string
          id: string
          is_active: boolean
          is_free_price: boolean
          label: string
          max_quantity: number | null
          min_quantity: number | null
          org_id: string
          price: number
          profit_margin: number | null
          tags: string[] | null
          unit: string | null
          updated_at: string
          vat_rate: number
        }
        Insert: {
          code: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          family_id: string
          id?: string
          is_active?: boolean
          is_free_price?: boolean
          label: string
          max_quantity?: number | null
          min_quantity?: number | null
          org_id: string
          price?: number
          profit_margin?: number | null
          tags?: string[] | null
          unit?: string | null
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          code?: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          family_id?: string
          id?: string
          is_active?: boolean
          is_free_price?: boolean
          label?: string
          max_quantity?: number | null
          min_quantity?: number | null
          org_id?: string
          price?: number
          profit_margin?: number | null
          tags?: string[] | null
          unit?: string | null
          updated_at?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "service_families"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_invitations: {
        Row: {
          created_at: string | null
          email: string
          id: string
          invited_by: string | null
          org_id: string
          role: string
          status: string
          token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          invited_by?: string | null
          org_id: string
          role?: string
          status?: string
          token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          invited_by?: string | null
          org_id?: string
          role?: string
          status?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          access_level: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          updated_at: string | null
        }
        Insert: {
          access_level?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          updated_at?: string | null
        }
        Update: {
          access_level?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      arrangements_with_calculated_price: {
        Row: {
          base_price: number | null
          calculated_price: number | null
          code: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          label: string | null
          max_nights: number | null
          min_nights: number | null
          org_id: string | null
          services_count: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          base_price?: number | null
          calculated_price?: never
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          label?: string | null
          max_nights?: number | null
          min_nights?: number | null
          org_id?: string | null
          services_count?: never
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          base_price?: number | null
          calculated_price?: never
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          label?: string | null
          max_nights?: number | null
          min_nights?: number | null
          org_id?: string | null
          services_count?: never
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      reservations_view_arrivals: {
        Row: {
          adults: number | null
          children: number | null
          date_arrival: string | null
          guest_name: string | null
          id: string | null
          org_id: string | null
          planned_time: string | null
          rate_total: number | null
          reference: string | null
          room_id: string | null
          room_number: string | null
          status: string | null
        }
        Relationships: []
      }
      services_with_family: {
        Row: {
          code: string | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          family_code: string | null
          family_color: string | null
          family_icon: string | null
          family_id: string | null
          family_label: string | null
          id: string | null
          is_active: boolean | null
          is_free_price: boolean | null
          label: string | null
          max_quantity: number | null
          min_quantity: number | null
          org_id: string | null
          price: number | null
          profit_margin: number | null
          tags: string[] | null
          unit: string | null
          updated_at: string | null
          vat_rate: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "service_families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      pms_assign_room: {
        Args: { p_res: string; p_room: string }
        Returns: undefined
      }
      pms_checkin: {
        Args: { p_res: string }
        Returns: undefined
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
