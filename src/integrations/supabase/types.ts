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
      app_users: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          last_login_at: string | null
          login: string
          login_code: string | null
          org_id: string
          password_expires_on: string | null
          profile_id: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          last_login_at?: string | null
          login: string
          login_code?: string | null
          org_id: string
          password_expires_on?: string | null
          profile_id?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          last_login_at?: string | null
          login?: string
          login_code?: string | null
          org_id?: string
          password_expires_on?: string | null
          profile_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_app_users_org_id"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "hotel_settings"
            referencedColumns: ["org_id"]
          },
        ]
      }
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
          {
            foreignKeyName: "fk_arrangement_services_arrangement_id"
            columns: ["arrangement_id"]
            isOneToOne: false
            referencedRelation: "arrangements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_arrangement_services_arrangement_id"
            columns: ["arrangement_id"]
            isOneToOne: false
            referencedRelation: "arrangements_with_calculated_price"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_arrangement_services_service_id"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_arrangement_services_service_id"
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
      guests: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company_address: string | null
          company_name: string | null
          country: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          document_expiry: string | null
          document_issuing_country: string | null
          document_number: string | null
          document_type: string | null
          email: string | null
          first_name: string
          guest_type: string | null
          id: string
          last_name: string
          marketing_consent: boolean | null
          nationality: string | null
          notes: string | null
          org_id: string
          phone: string | null
          postal_code: string | null
          preferences: Json | null
          preferred_communication: string | null
          special_requests: string | null
          state_province: string | null
          tax_id: string | null
          updated_at: string
          vip_status: boolean | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_address?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          document_expiry?: string | null
          document_issuing_country?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          first_name: string
          guest_type?: string | null
          id?: string
          last_name: string
          marketing_consent?: boolean | null
          nationality?: string | null
          notes?: string | null
          org_id: string
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          preferred_communication?: string | null
          special_requests?: string | null
          state_province?: string | null
          tax_id?: string | null
          updated_at?: string
          vip_status?: boolean | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_address?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          document_expiry?: string | null
          document_issuing_country?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          first_name?: string
          guest_type?: string | null
          id?: string
          last_name?: string
          marketing_consent?: boolean | null
          nationality?: string | null
          notes?: string | null
          org_id?: string
          phone?: string | null
          postal_code?: string | null
          preferences?: Json | null
          preferred_communication?: string | null
          special_requests?: string | null
          state_province?: string | null
          tax_id?: string | null
          updated_at?: string
          vip_status?: boolean | null
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
      invoices: {
        Row: {
          adults_count: number | null
          check_in_date: string | null
          check_out_date: string | null
          children_count: number | null
          created_at: string | null
          description: string | null
          due_date: string | null
          guest_address: string | null
          guest_email: string | null
          guest_id: string | null
          guest_name: string | null
          guest_phone: string | null
          id: number
          issue_date: string | null
          nights_count: number | null
          notes: string | null
          number: string | null
          org_id: string
          reference: string | null
          reservation_id: string | null
          room_number: string | null
          room_type: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          adults_count?: number | null
          check_in_date?: string | null
          check_out_date?: string | null
          children_count?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          guest_address?: string | null
          guest_email?: string | null
          guest_id?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: never
          issue_date?: string | null
          nights_count?: number | null
          notes?: string | null
          number?: string | null
          org_id: string
          reference?: string | null
          reservation_id?: string | null
          room_number?: string | null
          room_type?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          adults_count?: number | null
          check_in_date?: string | null
          check_out_date?: string | null
          children_count?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          guest_address?: string | null
          guest_email?: string | null
          guest_id?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: never
          issue_date?: string | null
          nights_count?: number | null
          notes?: string | null
          number?: string | null
          org_id?: string
          reference?: string | null
          reservation_id?: string | null
          room_number?: string | null
          room_type?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guest_stay_history"
            referencedColumns: ["guest_id"]
          },
          {
            foreignKeyName: "invoices_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "guest_stay_history"
            referencedColumns: ["reservation_id"]
          },
          {
            foreignKeyName: "invoices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "rack_reservations_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations_view_arrivals"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_money_accounts: {
        Row: {
          active: boolean | null
          api_provider: string | null
          created_at: string | null
          default_method_id: string | null
          display_name: string
          id: string
          merchant_id: string | null
          org_id: string
          provider: string
          settlement_account: string | null
          wallet_msisdn: string
        }
        Insert: {
          active?: boolean | null
          api_provider?: string | null
          created_at?: string | null
          default_method_id?: string | null
          display_name: string
          id?: string
          merchant_id?: string | null
          org_id: string
          provider: string
          settlement_account?: string | null
          wallet_msisdn: string
        }
        Update: {
          active?: boolean | null
          api_provider?: string | null
          created_at?: string | null
          default_method_id?: string | null
          display_name?: string
          id?: string
          merchant_id?: string | null
          org_id?: string
          provider?: string
          settlement_account?: string | null
          wallet_msisdn?: string
        }
        Relationships: [
          {
            foreignKeyName: "mobile_money_accounts_default_method_id_fkey"
            columns: ["default_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: number
          organization_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          organization_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          organization_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          active: boolean | null
          capture_mode: string
          code: string
          commission_percent: number | null
          created_at: string | null
          expense_service_code: string | null
          id: string
          kind: string
          label: string
          metadata: Json | null
          org_id: string
          settlement_delay_days: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          capture_mode?: string
          code: string
          commission_percent?: number | null
          created_at?: string | null
          expense_service_code?: string | null
          id?: string
          kind: string
          label: string
          metadata?: Json | null
          org_id: string
          settlement_delay_days?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          capture_mode?: string
          code?: string
          commission_percent?: number | null
          created_at?: string | null
          expense_service_code?: string | null
          id?: string
          kind?: string
          label?: string
          metadata?: Json | null
          org_id?: string
          settlement_delay_days?: number | null
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
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency_code: string | null
          id: string
          invoice_id: string
          metadata: Json | null
          method_id: string
          org_id: string
          reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency_code?: string | null
          id?: string
          invoice_id: string
          metadata?: Json | null
          method_id: string
          org_id: string
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency_code?: string | null
          id?: string
          invoice_id?: string
          metadata?: Json | null
          method_id?: string
          org_id?: string
          reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          key: string
          label: string
        }
        Insert: {
          category: string
          key: string
          label: string
        }
        Update: {
          category?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      profile_permissions: {
        Row: {
          allowed: boolean
          permission_key: string
          profile_id: string
        }
        Insert: {
          allowed?: boolean
          permission_key: string
          profile_id: string
        }
        Update: {
          allowed?: boolean
          permission_key?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
        ]
      }
      reservations: {
        Row: {
          adults: number | null
          checked_in_at: string | null
          checked_out_at: string | null
          children: number | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          created_by: string | null
          date_arrival: string
          date_departure: string | null
          guest_id: string | null
          id: string
          notes: string | null
          org_id: string
          planned_time: string | null
          rate_total: number | null
          reference: string | null
          room_id: string | null
          source: string | null
          source_reference: string | null
          special_requests: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          adults?: number | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          children?: number | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          date_arrival: string
          date_departure?: string | null
          guest_id?: string | null
          id?: string
          notes?: string | null
          org_id: string
          planned_time?: string | null
          rate_total?: number | null
          reference?: string | null
          room_id?: string | null
          source?: string | null
          source_reference?: string | null
          special_requests?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          adults?: number | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          children?: number | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          date_arrival?: string
          date_departure?: string | null
          guest_id?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          planned_time?: string | null
          rate_total?: number | null
          reference?: string | null
          room_id?: string | null
          source?: string | null
          source_reference?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reservations_guest_id"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guest_stay_history"
            referencedColumns: ["guest_id"]
          },
          {
            foreignKeyName: "fk_reservations_guest_id"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reservations_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guest_stay_history"
            referencedColumns: ["guest_id"]
          },
          {
            foreignKeyName: "reservations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "fk_rooms_room_type_id"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "fk_services_family_id"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "service_families"
            referencedColumns: ["id"]
          },
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
      user_organizations: {
        Row: {
          org_id: string
          user_id: string
        }
        Insert: {
          org_id: string
          user_id: string
        }
        Update: {
          org_id?: string
          user_id?: string
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
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
        Relationships: []
      }
      guest_stay_history: {
        Row: {
          adults: number | null
          children: number | null
          date_arrival: string | null
          date_departure: string | null
          email: string | null
          first_name: string | null
          guest_id: string | null
          invoice_number: string | null
          invoice_total: number | null
          last_name: string | null
          nights_count: number | null
          phone: string | null
          rate_total: number | null
          reservation_id: string | null
          reservation_reference: string | null
          reservation_status: string | null
          room_number: string | null
          room_type: string | null
        }
        Relationships: []
      }
      rack_reservations_enriched: {
        Row: {
          adults: number | null
          children: number | null
          date_arrival: string | null
          date_departure: string | null
          id: string | null
          org_id: string | null
          rate_total: number | null
          reference: string | null
          room_floor: string | null
          room_id: string | null
          room_number: string | null
          room_type_code: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reservations_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "fk_reservations_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "fk_services_family_id"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "service_families"
            referencedColumns: ["id"]
          },
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
      get_current_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_permission: {
        Args: { p_permission: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      pms_assign_room: {
        Args: { p_res: string; p_room: string }
        Returns: undefined
      }
      pms_checkin: {
        Args: { p_res: string }
        Returns: undefined
      }
      pms_move_reservation: {
        Args: { p_res: string; p_room: string }
        Returns: {
          adults: number | null
          checked_in_at: string | null
          checked_out_at: string | null
          children: number | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          created_by: string | null
          date_arrival: string
          date_departure: string | null
          guest_id: string | null
          id: string
          notes: string | null
          org_id: string
          planned_time: string | null
          rate_total: number | null
          reference: string | null
          room_id: string | null
          source: string | null
          source_reference: string | null
          special_requests: string | null
          status: string
          updated_at: string | null
        }
      }
      pms_search_free_rooms: {
        Args: {
          p_org: string
          p_start: string
          p_end: string
          p_exclude_room_ids?: string[]
        }
        Returns: {
          id: string
          number: string
          type: string
          floor: string
          status: string
        }[]
      }
      pms_validate_move: {
        Args: { p_res: string; p_room: string }
        Returns: {
          ok: boolean
          reason: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "staff" | "user"
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
    Enums: {
      app_role: ["admin", "manager", "staff", "user"],
    },
  },
} as const
