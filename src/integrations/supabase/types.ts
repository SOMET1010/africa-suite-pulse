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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      active_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_definition_id: string
          created_at: string
          current_value: number
          escalated: boolean | null
          id: string
          message: string
          notification_sent: boolean | null
          org_id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          started_at: string
          status: Database["public"]["Enums"]["alert_status"]
          threshold_value: number
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_definition_id: string
          created_at?: string
          current_value: number
          escalated?: boolean | null
          id?: string
          message: string
          notification_sent?: boolean | null
          org_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          started_at?: string
          status?: Database["public"]["Enums"]["alert_status"]
          threshold_value: number
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_definition_id?: string
          created_at?: string
          current_value?: number
          escalated?: boolean | null
          id?: string
          message?: string
          notification_sent?: boolean | null
          org_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          started_at?: string
          status?: Database["public"]["Enums"]["alert_status"]
          threshold_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_alerts_alert_definition_id_fkey"
            columns: ["alert_definition_id"]
            isOneToOne: false
            referencedRelation: "alert_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          org_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          org_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          org_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      alert_definitions: {
        Row: {
          condition_operator: string
          created_at: string
          created_by: string | null
          description: string | null
          evaluation_window_minutes: number | null
          id: string
          is_active: boolean | null
          metric_name: string
          name: string
          notification_channels: Json | null
          org_id: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          threshold_value: number
          updated_at: string
        }
        Insert: {
          condition_operator: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          evaluation_window_minutes?: number | null
          id?: string
          is_active?: boolean | null
          metric_name: string
          name: string
          notification_channels?: Json | null
          org_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          threshold_value: number
          updated_at?: string
        }
        Update: {
          condition_operator?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          evaluation_window_minutes?: number | null
          id?: string
          is_active?: boolean | null
          metric_name?: string
          name?: string
          notification_channels?: Json | null
          org_id?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          threshold_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      allotments: {
        Row: {
          code: string
          contact_email: string | null
          contact_phone: string | null
          contract_terms: string | null
          created_at: string
          id: string
          is_active: boolean
          notes: string | null
          org_id: string
          partner_name: string
          partner_type: string
          rate_per_night: number | null
          release_date: string | null
          remaining_units: number
          room_type: string
          total_units: number
          updated_at: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          contract_terms?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          org_id: string
          partner_name: string
          partner_type: string
          rate_per_night?: number | null
          release_date?: string | null
          remaining_units: number
          room_type: string
          total_units: number
          updated_at?: string
          valid_from: string
          valid_until: string
        }
        Update: {
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          contract_terms?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          org_id?: string
          partner_name?: string
          partner_type?: string
          rate_per_night?: number | null
          release_date?: string | null
          remaining_units?: number
          room_type?: string
          total_units?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      analytics_predictions: {
        Row: {
          confidence_score: number
          created_at: string
          created_by: string | null
          id: string
          input_features: Json
          model_version: string
          org_id: string
          predicted_value: number
          prediction_type: string
          target_date: string
        }
        Insert: {
          confidence_score: number
          created_at?: string
          created_by?: string | null
          id?: string
          input_features?: Json
          model_version: string
          org_id: string
          predicted_value: number
          prediction_type: string
          target_date: string
        }
        Update: {
          confidence_score?: number
          created_at?: string
          created_by?: string | null
          id?: string
          input_features?: Json
          model_version?: string
          org_id?: string
          predicted_value?: number
          prediction_type?: string
          target_date?: string
        }
        Relationships: []
      }
      api_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          name: string
          org_id: string
          permissions: string[]
          rate_limit: number
          token_hash: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name: string
          org_id: string
          permissions?: string[]
          rate_limit?: number
          token_hash: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string
          org_id?: string
          permissions?: string[]
          rate_limit?: number
          token_hash?: string
        }
        Relationships: []
      }
      app_users: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          last_login_at: string | null
          login: string
          login_code: string | null
          org_id: string
          password_expires_on: string | null
          phone: string | null
          profile_id: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          last_login_at?: string | null
          login: string
          login_code?: string | null
          org_id: string
          password_expires_on?: string | null
          phone?: string | null
          profile_id?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          last_login_at?: string | null
          login?: string
          login_code?: string | null
          org_id?: string
          password_expires_on?: string | null
          phone?: string | null
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
          {
            foreignKeyName: "fk_app_users_org_id"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_daily_revenue"
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
      audit_checkpoints: {
        Row: {
          checkpoint_name: string
          checkpoint_type: string
          completed_at: string | null
          created_at: string
          data: Json
          error_message: string | null
          id: string
          is_critical: boolean
          order_index: number
          session_id: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          checkpoint_name: string
          checkpoint_type: string
          completed_at?: string | null
          created_at?: string
          data?: Json
          error_message?: string | null
          id?: string
          is_critical?: boolean
          order_index?: number
          session_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          checkpoint_name?: string
          checkpoint_type?: string
          completed_at?: string | null
          created_at?: string
          data?: Json
          error_message?: string | null
          id?: string
          is_critical?: boolean
          order_index?: number
          session_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_checkpoints_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "night_audit_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          new_values: Json | null
          occurred_at: string
          old_values: Json | null
          org_id: string
          record_id: string | null
          severity: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          new_values?: Json | null
          occurred_at?: string
          old_values?: Json | null
          org_id: string
          record_id?: string | null
          severity?: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          new_values?: Json | null
          occurred_at?: string
          old_values?: Json | null
          org_id?: string
          record_id?: string | null
          severity?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      beneficiary_cards: {
        Row: {
          beneficiary_id: string
          card_number: string
          card_type: string
          created_at: string
          expires_date: string | null
          id: string
          issued_date: string
          last_used_at: string | null
          metadata: Json | null
          org_id: string
          status: string
          updated_at: string
        }
        Insert: {
          beneficiary_id: string
          card_number: string
          card_type?: string
          created_at?: string
          expires_date?: string | null
          id?: string
          issued_date?: string
          last_used_at?: string | null
          metadata?: Json | null
          org_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          beneficiary_id?: string
          card_number?: string
          card_type?: string
          created_at?: string
          expires_date?: string | null
          id?: string
          issued_date?: string
          last_used_at?: string | null
          metadata?: Json | null
          org_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiary_cards_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "collective_beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellation_policies: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          label: string
          org_id: string
          rules: Json
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          label: string
          org_id: string
          rules: Json
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          label?: string
          org_id?: string
          rules?: Json
          updated_at?: string
        }
        Relationships: []
      }
      channel_integrations: {
        Row: {
          api_credentials: Json
          channel_name: string
          channel_type: string
          created_at: string
          id: string
          is_active: boolean
          last_sync_at: string | null
          mapping_config: Json
          org_id: string
          sync_settings: Json
          sync_status: string
          updated_at: string
        }
        Insert: {
          api_credentials?: Json
          channel_name: string
          channel_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          mapping_config?: Json
          org_id: string
          sync_settings?: Json
          sync_status?: string
          updated_at?: string
        }
        Update: {
          api_credentials?: Json
          channel_name?: string
          channel_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          mapping_config?: Json
          org_id?: string
          sync_settings?: Json
          sync_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      cleaning_standards: {
        Row: {
          checklist_items: Json
          created_at: string
          estimated_duration: number
          id: string
          is_active: boolean
          org_id: string
          priority_rules: Json | null
          quality_criteria: Json | null
          required_supplies: Json | null
          room_type: string | null
          task_type: string
          updated_at: string
        }
        Insert: {
          checklist_items?: Json
          created_at?: string
          estimated_duration?: number
          id?: string
          is_active?: boolean
          org_id: string
          priority_rules?: Json | null
          quality_criteria?: Json | null
          required_supplies?: Json | null
          room_type?: string | null
          task_type: string
          updated_at?: string
        }
        Update: {
          checklist_items?: Json
          created_at?: string
          estimated_duration?: number
          id?: string
          is_active?: boolean
          org_id?: string
          priority_rules?: Json | null
          quality_criteria?: Json | null
          required_supplies?: Json | null
          room_type?: string | null
          task_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      collective_beneficiaries: {
        Row: {
          allergies: Json | null
          beneficiary_code: string
          category: string
          collective_organization_id: string
          created_at: string
          credit_balance: number | null
          department: string | null
          dietary_restrictions: Json | null
          email: string | null
          first_name: string
          grade_level: string | null
          guest_id: string | null
          id: string
          is_active: boolean
          last_name: string
          monthly_allowance: number | null
          org_id: string
          phone: string | null
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          allergies?: Json | null
          beneficiary_code: string
          category: string
          collective_organization_id: string
          created_at?: string
          credit_balance?: number | null
          department?: string | null
          dietary_restrictions?: Json | null
          email?: string | null
          first_name: string
          grade_level?: string | null
          guest_id?: string | null
          id?: string
          is_active?: boolean
          last_name: string
          monthly_allowance?: number | null
          org_id: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: Json | null
          beneficiary_code?: string
          category?: string
          collective_organization_id?: string
          created_at?: string
          credit_balance?: number | null
          department?: string | null
          dietary_restrictions?: Json | null
          email?: string | null
          first_name?: string
          grade_level?: string | null
          guest_id?: string | null
          id?: string
          is_active?: boolean
          last_name?: string
          monthly_allowance?: number | null
          org_id?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collective_beneficiaries_collective_organization_id_fkey"
            columns: ["collective_organization_id"]
            isOneToOne: false
            referencedRelation: "collective_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collective_beneficiaries_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guest_stay_history"
            referencedColumns: ["guest_id"]
          },
          {
            foreignKeyName: "collective_beneficiaries_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      collective_meals: {
        Row: {
          attended_at: string
          beneficiary_id: string
          business_type: string
          collective_organization_id: string
          created_at: string
          id: string
          meal_date: string
          meal_type: string
          org_id: string
          paid_amount: number
          payment_method: string | null
          pos_order_id: string | null
          subsidy_amount: number | null
          total_amount: number
        }
        Insert: {
          attended_at?: string
          beneficiary_id: string
          business_type?: string
          collective_organization_id: string
          created_at?: string
          id?: string
          meal_date?: string
          meal_type: string
          org_id: string
          paid_amount: number
          payment_method?: string | null
          pos_order_id?: string | null
          subsidy_amount?: number | null
          total_amount: number
        }
        Update: {
          attended_at?: string
          beneficiary_id?: string
          business_type?: string
          collective_organization_id?: string
          created_at?: string
          id?: string
          meal_date?: string
          meal_type?: string
          org_id?: string
          paid_amount?: number
          payment_method?: string | null
          pos_order_id?: string | null
          subsidy_amount?: number | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "collective_meals_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "collective_beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collective_meals_collective_organization_id_fkey"
            columns: ["collective_organization_id"]
            isOneToOne: false
            referencedRelation: "collective_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      collective_menus: {
        Row: {
          allergens: Json | null
          collective_organization_id: string
          created_at: string
          created_by: string | null
          dietary_options: Json | null
          id: string
          is_published: boolean | null
          meal_type: string
          menu_date: string
          menu_items: Json
          org_id: string
          price: number
          updated_at: string
        }
        Insert: {
          allergens?: Json | null
          collective_organization_id: string
          created_at?: string
          created_by?: string | null
          dietary_options?: Json | null
          id?: string
          is_published?: boolean | null
          meal_type: string
          menu_date: string
          menu_items?: Json
          org_id: string
          price: number
          updated_at?: string
        }
        Update: {
          allergens?: Json | null
          collective_organization_id?: string
          created_at?: string
          created_by?: string | null
          dietary_options?: Json | null
          id?: string
          is_published?: boolean | null
          meal_type?: string
          menu_date?: string
          menu_items?: Json
          org_id?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collective_menus_collective_organization_id_fkey"
            columns: ["collective_organization_id"]
            isOneToOne: false
            referencedRelation: "collective_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      collective_organizations: {
        Row: {
          address: string | null
          budget_consumed: number | null
          budget_limit: number | null
          code: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          name: string
          org_id: string
          organization_type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          budget_consumed?: number | null
          budget_limit?: number | null
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name: string
          org_id: string
          organization_type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          budget_consumed?: number | null
          budget_limit?: number | null
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          name?: string
          org_id?: string
          organization_type?: string
          updated_at?: string
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
      custom_dashboards: {
        Row: {
          created_at: string
          description: string | null
          filters: Json
          id: string
          is_default: boolean
          is_public: boolean
          layout: Json
          name: string
          org_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          filters?: Json
          id?: string
          is_default?: boolean
          is_public?: boolean
          layout: Json
          name: string
          org_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          filters?: Json
          id?: string
          is_default?: boolean
          is_public?: boolean
          layout?: Json
          name?: string
          org_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      customer_loyalty_points: {
        Row: {
          created_at: string
          guest_id: string
          id: string
          last_activity_at: string | null
          program_id: string
          tier_achieved_at: string | null
          tier_id: string | null
          total_points: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_id: string
          id?: string
          last_activity_at?: string | null
          program_id: string
          tier_achieved_at?: string | null
          tier_id?: string | null
          total_points?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_id?: string
          id?: string
          last_activity_at?: string | null
          program_id?: string
          tier_achieved_at?: string | null
          tier_id?: string | null
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      daily_closures: {
        Row: {
          arrivals_count: number
          closure_date: string
          created_at: string
          departures_count: number
          discrepancies: Json
          id: string
          no_shows_count: number
          occupied_rooms: number
          org_id: string
          outstanding_balance: number
          payments_total: number
          revenue_total: number
          session_id: string
          system_totals: Json
          tax_total: number
          total_rooms: number
        }
        Insert: {
          arrivals_count?: number
          closure_date: string
          created_at?: string
          departures_count?: number
          discrepancies?: Json
          id?: string
          no_shows_count?: number
          occupied_rooms?: number
          org_id?: string
          outstanding_balance?: number
          payments_total?: number
          revenue_total?: number
          session_id: string
          system_totals?: Json
          tax_total?: number
          total_rooms?: number
        }
        Update: {
          arrivals_count?: number
          closure_date?: string
          created_at?: string
          departures_count?: number
          discrepancies?: Json
          id?: string
          no_shows_count?: number
          occupied_rooms?: number
          org_id?: string
          outstanding_balance?: number
          payments_total?: number
          revenue_total?: number
          session_id?: string
          system_totals?: Json
          tax_total?: number
          total_rooms?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_closures_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "night_audit_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      data_processing_logs: {
        Row: {
          completed_at: string | null
          data_categories: string[]
          data_subject_id: string | null
          id: string
          legal_basis: string
          org_id: string
          processing_type: string
          processor_info: Json | null
          purpose: string
          requested_at: string
          requested_by: string | null
          retention_period: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          data_categories?: string[]
          data_subject_id?: string | null
          id?: string
          legal_basis: string
          org_id: string
          processing_type: string
          processor_info?: Json | null
          purpose: string
          requested_at?: string
          requested_by?: string | null
          retention_period?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          data_categories?: string[]
          data_subject_id?: string | null
          id?: string
          legal_basis?: string
          org_id?: string
          processing_type?: string
          processor_info?: Json | null
          purpose?: string
          requested_at?: string
          requested_by?: string | null
          retention_period?: string | null
          status?: string
        }
        Relationships: []
      }
      deployment_types: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          price_modifier: number
          setup_fee: number | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price_modifier?: number
          setup_fee?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price_modifier?: number
          setup_fee?: number | null
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          category: string | null
          code: string
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          org_id: string
          preview_data: Json | null
          styles: Json | null
          type: string
          updated_at: string
          variables: Json | null
          version: number
        }
        Insert: {
          category?: string | null
          code: string
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          org_id: string
          preview_data?: Json | null
          styles?: Json | null
          type: string
          updated_at?: string
          variables?: Json | null
          version?: number
        }
        Update: {
          category?: string | null
          code?: string
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          org_id?: string
          preview_data?: Json | null
          styles?: Json | null
          type?: string
          updated_at?: string
          variables?: Json | null
          version?: number
        }
        Relationships: []
      }
      equipment: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          created_by: string | null
          equipment_code: string
          id: string
          installation_date: string | null
          last_maintenance_date: string | null
          location: string | null
          maintenance_frequency_days: number | null
          model: string | null
          name: string
          next_maintenance_date: string | null
          notes: string | null
          org_id: string
          photo_url: string | null
          purchase_date: string | null
          serial_number: string | null
          specifications: Json | null
          status: string
          updated_at: string
          warranty_until: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          equipment_code: string
          id?: string
          installation_date?: string | null
          last_maintenance_date?: string | null
          location?: string | null
          maintenance_frequency_days?: number | null
          model?: string | null
          name: string
          next_maintenance_date?: string | null
          notes?: string | null
          org_id: string
          photo_url?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          specifications?: Json | null
          status?: string
          updated_at?: string
          warranty_until?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          equipment_code?: string
          id?: string
          installation_date?: string | null
          last_maintenance_date?: string | null
          location?: string | null
          maintenance_frequency_days?: number | null
          model?: string | null
          name?: string
          next_maintenance_date?: string | null
          notes?: string | null
          org_id?: string
          photo_url?: string | null
          purchase_date?: string | null
          serial_number?: string | null
          specifications?: Json | null
          status?: string
          updated_at?: string
          warranty_until?: string | null
        }
        Relationships: []
      }
      fiscal_archive_entries: {
        Row: {
          amount: number | null
          archive_id: string
          archived_at: string
          currency_code: string
          entry_hash: string
          entry_type: string
          id: string
          previous_hash: string | null
          reference_id: string | null
          reference_number: string | null
          tax_amount: number | null
          transaction_data: Json
          transaction_timestamp: string
        }
        Insert: {
          amount?: number | null
          archive_id: string
          archived_at?: string
          currency_code?: string
          entry_hash: string
          entry_type: string
          id?: string
          previous_hash?: string | null
          reference_id?: string | null
          reference_number?: string | null
          tax_amount?: number | null
          transaction_data?: Json
          transaction_timestamp: string
        }
        Update: {
          amount?: number | null
          archive_id?: string
          archived_at?: string
          currency_code?: string
          entry_hash?: string
          entry_type?: string
          id?: string
          previous_hash?: string | null
          reference_id?: string | null
          reference_number?: string | null
          tax_amount?: number | null
          transaction_data?: Json
          transaction_timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_archive_entries_archive_id_fkey"
            columns: ["archive_id"]
            isOneToOne: false
            referencedRelation: "fiscal_archives"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_archives: {
        Row: {
          archive_data: Json
          archive_date: string
          archive_type: string
          certificate_number: string
          certification_number: string
          cloud_backup_url: string | null
          created_at: string
          created_by: string | null
          digital_signature: string
          file_path: string | null
          file_size_bytes: number | null
          hash_signature: string
          id: string
          is_sealed: boolean
          org_id: string
          period_end: string
          period_start: string
          sealed_at: string | null
          software_version: string
          status: string
          updated_at: string
          usb_export_path: string | null
          validation_errors: Json | null
        }
        Insert: {
          archive_data?: Json
          archive_date: string
          archive_type: string
          certificate_number: string
          certification_number?: string
          cloud_backup_url?: string | null
          created_at?: string
          created_by?: string | null
          digital_signature: string
          file_path?: string | null
          file_size_bytes?: number | null
          hash_signature: string
          id?: string
          is_sealed?: boolean
          org_id: string
          period_end: string
          period_start: string
          sealed_at?: string | null
          software_version: string
          status?: string
          updated_at?: string
          usb_export_path?: string | null
          validation_errors?: Json | null
        }
        Update: {
          archive_data?: Json
          archive_date?: string
          archive_type?: string
          certificate_number?: string
          certification_number?: string
          cloud_backup_url?: string | null
          created_at?: string
          created_by?: string | null
          digital_signature?: string
          file_path?: string | null
          file_size_bytes?: number | null
          hash_signature?: string
          id?: string
          is_sealed?: boolean
          org_id?: string
          period_end?: string
          period_start?: string
          sealed_at?: string | null
          software_version?: string
          status?: string
          updated_at?: string
          usb_export_path?: string | null
          validation_errors?: Json | null
        }
        Relationships: []
      }
      fiscal_compliance_logs: {
        Row: {
          archive_id: string | null
          compliance_notes: string | null
          compliance_status: string
          event_data: Json | null
          event_description: string
          event_type: string
          id: string
          org_id: string
          performed_at: string
          performed_by: string | null
        }
        Insert: {
          archive_id?: string | null
          compliance_notes?: string | null
          compliance_status?: string
          event_data?: Json | null
          event_description: string
          event_type: string
          id?: string
          org_id: string
          performed_at?: string
          performed_by?: string | null
        }
        Update: {
          archive_id?: string | null
          compliance_notes?: string | null
          compliance_status?: string
          event_data?: Json | null
          event_description?: string
          event_type?: string
          id?: string
          org_id?: string
          performed_at?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_compliance_logs_archive_id_fkey"
            columns: ["archive_id"]
            isOneToOne: false
            referencedRelation: "fiscal_archives"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_jurisdictions: {
        Row: {
          code: string
          country_code: string
          created_at: string
          currency_code: string
          fiscal_rules: Json | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          region: string | null
          tax_rates: Json
          updated_at: string
        }
        Insert: {
          code: string
          country_code: string
          created_at?: string
          currency_code?: string
          fiscal_rules?: Json | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          region?: string | null
          tax_rates?: Json
          updated_at?: string
        }
        Update: {
          code?: string
          country_code?: string
          created_at?: string
          currency_code?: string
          fiscal_rules?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          region?: string | null
          tax_rates?: Json
          updated_at?: string
        }
        Relationships: []
      }
      fne_api_logs: {
        Row: {
          api_endpoint: string
          api_timestamp: string
          created_at: string
          error_code: string | null
          error_message: string | null
          fne_invoice_id: string | null
          fne_reference_number: string | null
          http_method: string
          id: string
          ntp_offset_ms: number | null
          ntp_synchronized: boolean | null
          operation_type: string
          order_id: string | null
          org_id: string
          request_headers: Json | null
          request_payload: Json | null
          response_body: Json | null
          response_headers: Json | null
          response_status: number | null
          response_time_ms: number | null
          success: boolean
        }
        Insert: {
          api_endpoint: string
          api_timestamp?: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          fne_invoice_id?: string | null
          fne_reference_number?: string | null
          http_method?: string
          id?: string
          ntp_offset_ms?: number | null
          ntp_synchronized?: boolean | null
          operation_type: string
          order_id?: string | null
          org_id: string
          request_headers?: Json | null
          request_payload?: Json | null
          response_body?: Json | null
          response_headers?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          success?: boolean
        }
        Update: {
          api_endpoint?: string
          api_timestamp?: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          fne_invoice_id?: string | null
          fne_reference_number?: string | null
          http_method?: string
          id?: string
          ntp_offset_ms?: number | null
          ntp_synchronized?: boolean | null
          operation_type?: string
          order_id?: string | null
          org_id?: string
          request_headers?: Json | null
          request_payload?: Json | null
          response_body?: Json | null
          response_headers?: Json | null
          response_status?: number | null
          response_time_ms?: number | null
          success?: boolean
        }
        Relationships: []
      }
      fne_pending_invoices: {
        Row: {
          created_at: string
          id: string
          invoice_payload: Json
          last_error_code: string | null
          last_error_message: string | null
          max_retries: number
          next_retry_at: string | null
          order_id: string
          org_id: string
          priority: number
          processed_at: string | null
          processing_timeout: string | null
          retry_count: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_payload: Json
          last_error_code?: string | null
          last_error_message?: string | null
          max_retries?: number
          next_retry_at?: string | null
          order_id: string
          org_id: string
          priority?: number
          processed_at?: string | null
          processing_timeout?: string | null
          retry_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invoice_payload?: Json
          last_error_code?: string | null
          last_error_message?: string | null
          max_retries?: number
          next_retry_at?: string | null
          order_id?: string
          org_id?: string
          priority?: number
          processed_at?: string | null
          processing_timeout?: string | null
          retry_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      guest_access_rate_limits: {
        Row: {
          access_count: number
          created_at: string
          id: string
          org_id: string
          user_id: string
          window_start: string
        }
        Insert: {
          access_count?: number
          created_at?: string
          id?: string
          org_id: string
          user_id: string
          window_start?: string
        }
        Update: {
          access_count?: number
          created_at?: string
          id?: string
          org_id?: string
          user_id?: string
          window_start?: string
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
      hotel_dates: {
        Row: {
          created_at: string
          created_by: string | null
          current_hotel_date: string
          id: string
          mode: string
          next_switch_at: string
          org_id: string
          switch_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          current_hotel_date: string
          id?: string
          mode?: string
          next_switch_at: string
          org_id: string
          switch_time?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          current_hotel_date?: string
          id?: string
          mode?: string
          next_switch_at?: string
          org_id?: string
          switch_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      hotel_health_status: {
        Row: {
          active_incidents: number | null
          created_at: string
          error_rate: number | null
          id: string
          last_check_at: string
          org_id: string
          response_time_ms: number | null
          status: string
          updated_at: string
          uptime_percentage: number | null
        }
        Insert: {
          active_incidents?: number | null
          created_at?: string
          error_rate?: number | null
          id?: string
          last_check_at?: string
          org_id: string
          response_time_ms?: number | null
          status?: string
          updated_at?: string
          uptime_percentage?: number | null
        }
        Update: {
          active_incidents?: number | null
          created_at?: string
          error_rate?: number | null
          id?: string
          last_check_at?: string
          org_id?: string
          response_time_ms?: number | null
          status?: string
          updated_at?: string
          uptime_percentage?: number | null
        }
        Relationships: []
      }
      hotel_settings: {
        Row: {
          activation_code: string | null
          address: string | null
          auto_switch_time: string
          city: string | null
          country: string | null
          created_at: string
          currency: string | null
          date_hotel_mode: string
          description: string | null
          email: string | null
          id: string
          is_activated: boolean | null
          logo_url: string | null
          max_overbooking: number
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
          auto_switch_time?: string
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          date_hotel_mode?: string
          description?: string | null
          email?: string | null
          id?: string
          is_activated?: boolean | null
          logo_url?: string | null
          max_overbooking?: number
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
          auto_switch_time?: string
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          date_hotel_mode?: string
          description?: string | null
          email?: string | null
          id?: string
          is_activated?: boolean | null
          logo_url?: string | null
          max_overbooking?: number
          name?: string
          org_id?: string
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      housekeeping_staff: {
        Row: {
          contact_info: Json | null
          created_at: string
          current_assignment: string | null
          employee_id: string
          hire_date: string | null
          id: string
          last_activity: string | null
          name: string
          org_id: string
          performance_rating: number | null
          role: string
          shift_end: string | null
          shift_start: string | null
          skills: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string
          current_assignment?: string | null
          employee_id: string
          hire_date?: string | null
          id?: string
          last_activity?: string | null
          name: string
          org_id: string
          performance_rating?: number | null
          role: string
          shift_end?: string | null
          shift_start?: string | null
          skills?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          contact_info?: Json | null
          created_at?: string
          current_assignment?: string | null
          employee_id?: string
          hire_date?: string | null
          id?: string
          last_activity?: string | null
          name?: string
          org_id?: string
          performance_rating?: number | null
          role?: string
          shift_end?: string | null
          shift_start?: string | null
          skills?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      housekeeping_tasks: {
        Row: {
          actual_duration: number | null
          assigned_to: string | null
          checklist_items: Json | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          estimated_duration: number
          guest_status: string | null
          id: string
          linen_change_details: Json | null
          notes: string | null
          org_id: string
          priority: string
          quality_notes: string | null
          quality_score: number | null
          room_number: string
          scheduled_start: string | null
          special_instructions: string | null
          started_at: string | null
          status: string
          task_type: string
          updated_at: string
        }
        Insert: {
          actual_duration?: number | null
          assigned_to?: string | null
          checklist_items?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          estimated_duration?: number
          guest_status?: string | null
          id?: string
          linen_change_details?: Json | null
          notes?: string | null
          org_id: string
          priority?: string
          quality_notes?: string | null
          quality_score?: number | null
          room_number: string
          scheduled_start?: string | null
          special_instructions?: string | null
          started_at?: string | null
          status?: string
          task_type: string
          updated_at?: string
        }
        Update: {
          actual_duration?: number | null
          assigned_to?: string | null
          checklist_items?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          estimated_duration?: number
          guest_status?: string | null
          id?: string
          linen_change_details?: Json | null
          notes?: string | null
          org_id?: string
          priority?: string
          quality_notes?: string | null
          quality_score?: number | null
          room_number?: string
          scheduled_start?: string | null
          special_instructions?: string | null
          started_at?: string | null
          status?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          billing_condition: string | null
          created_at: string
          description: string
          folio_number: number
          id: string
          invoice_id: number
          org_id: string
          quantity: number
          service_code: string
          total_price: number
          unit_price: number
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          billing_condition?: string | null
          created_at?: string
          description: string
          folio_number?: number
          id?: string
          invoice_id: number
          org_id?: string
          quantity?: number
          service_code: string
          total_price?: number
          unit_price?: number
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          billing_condition?: string | null
          created_at?: string
          description?: string
          folio_number?: number
          id?: string
          invoice_id?: number
          org_id?: string
          quantity?: number
          service_code?: string
          total_price?: number
          unit_price?: number
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
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
          folio_number: number | null
          group_billing_mode: string | null
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
          folio_number?: number | null
          group_billing_mode?: string | null
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
          folio_number?: number | null
          group_billing_mode?: string | null
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
            referencedRelation: "rack_data_view"
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
          {
            foreignKeyName: "invoices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      linen_inventory: {
        Row: {
          clean_quantity: number
          cost_per_unit: number | null
          created_at: string
          damaged_quantity: number
          description: string | null
          dirty_quantity: number
          id: string
          in_use_quantity: number
          item_code: string
          item_type: string
          last_restocked: string | null
          minimum_stock: number
          org_id: string
          supplier: string | null
          total_quantity: number
          updated_at: string
        }
        Insert: {
          clean_quantity?: number
          cost_per_unit?: number | null
          created_at?: string
          damaged_quantity?: number
          description?: string | null
          dirty_quantity?: number
          id?: string
          in_use_quantity?: number
          item_code: string
          item_type: string
          last_restocked?: string | null
          minimum_stock?: number
          org_id: string
          supplier?: string | null
          total_quantity?: number
          updated_at?: string
        }
        Update: {
          clean_quantity?: number
          cost_per_unit?: number | null
          created_at?: string
          damaged_quantity?: number
          description?: string | null
          dirty_quantity?: number
          id?: string
          in_use_quantity?: number
          item_code?: string
          item_type?: string
          last_restocked?: string | null
          minimum_stock?: number
          org_id?: string
          supplier?: string | null
          total_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_programs: {
        Row: {
          created_at: string
          currency_code: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          points_per_currency_unit: number
          points_per_night: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          points_per_currency_unit?: number
          points_per_night?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          points_per_currency_unit?: number
          points_per_night?: number
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_tiers: {
        Row: {
          benefits: Json
          code: string
          color: string
          created_at: string
          id: string
          is_active: boolean
          min_points: number
          name: string
          program_id: string
          sort_order: number
        }
        Insert: {
          benefits?: Json
          code: string
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          min_points?: number
          name: string
          program_id: string
          sort_order?: number
        }
        Update: {
          benefits?: Json
          code?: string
          color?: string
          created_at?: string
          id?: string
          is_active?: boolean
          min_points?: number
          name?: string
          program_id?: string
          sort_order?: number
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          guest_id: string
          id: string
          points: number
          program_id: string
          reference: string | null
          reservation_id: string | null
          transaction_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          guest_id: string
          id?: string
          points: number
          program_id: string
          reference?: string | null
          reservation_id?: string | null
          transaction_type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          guest_id?: string
          id?: string
          points?: number
          program_id?: string
          reference?: string | null
          reservation_id?: string | null
          transaction_type?: string
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          actual_cost: number | null
          actual_duration_hours: number | null
          assigned_to: string | null
          category: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string
          equipment_id: string | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          id: string
          location: string | null
          notes: string | null
          org_id: string
          parts_used: Json | null
          photos_after: Json | null
          photos_before: Json | null
          priority: string
          reported_by: string | null
          request_number: string
          room_id: string | null
          scheduled_date: string | null
          started_at: string | null
          status: string
          title: string
          updated_at: string
          work_performed: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_duration_hours?: number | null
          assigned_to?: string | null
          category: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          equipment_id?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          org_id: string
          parts_used?: Json | null
          photos_after?: Json | null
          photos_before?: Json | null
          priority?: string
          reported_by?: string | null
          request_number: string
          room_id?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string
          work_performed?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_duration_hours?: number | null
          assigned_to?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          equipment_id?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          org_id?: string
          parts_used?: Json | null
          photos_after?: Json | null
          photos_before?: Json | null
          priority?: string
          reported_by?: string | null
          request_number?: string
          room_id?: string | null
          scheduled_date?: string | null
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          work_performed?: string | null
        }
        Relationships: []
      }
      maintenance_schedules: {
        Row: {
          assigned_technician: string | null
          created_at: string
          created_by: string | null
          equipment_id: string
          estimated_duration_hours: number | null
          frequency_type: string
          frequency_value: number
          id: string
          is_active: boolean
          last_executed_date: string | null
          next_execution_date: string
          org_id: string
          required_parts: Json | null
          schedule_name: string
          task_template: string
          updated_at: string
        }
        Insert: {
          assigned_technician?: string | null
          created_at?: string
          created_by?: string | null
          equipment_id: string
          estimated_duration_hours?: number | null
          frequency_type: string
          frequency_value?: number
          id?: string
          is_active?: boolean
          last_executed_date?: string | null
          next_execution_date: string
          org_id: string
          required_parts?: Json | null
          schedule_name: string
          task_template: string
          updated_at?: string
        }
        Update: {
          assigned_technician?: string | null
          created_at?: string
          created_by?: string | null
          equipment_id?: string
          estimated_duration_hours?: number | null
          frequency_type?: string
          frequency_value?: number
          id?: string
          is_active?: boolean
          last_executed_date?: string | null
          next_execution_date?: string
          org_id?: string
          required_parts?: Json | null
          schedule_name?: string
          task_template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_allowances: {
        Row: {
          allowance_type: string
          amount: number
          beneficiary_id: string
          created_at: string
          id: string
          metadata: Json | null
          org_id: string
          purchase_date: string | null
          remaining_amount: number
          status: string
          updated_at: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          allowance_type: string
          amount: number
          beneficiary_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          org_id: string
          purchase_date?: string | null
          remaining_amount: number
          status?: string
          updated_at?: string
          valid_from: string
          valid_until: string
        }
        Update: {
          allowance_type?: string
          amount?: number
          beneficiary_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          org_id?: string
          purchase_date?: string | null
          remaining_amount?: number
          status?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_allowances_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "collective_beneficiaries"
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
      module_packages: {
        Row: {
          base_price_monthly: number
          code: string
          created_at: string
          description: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean
          is_featured: boolean | null
          module_ids: string[]
          name: string
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          base_price_monthly: number
          code: string
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          is_featured?: boolean | null
          module_ids: string[]
          name: string
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          base_price_monthly?: number
          code?: string
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean
          is_featured?: boolean | null
          module_ids?: string[]
          name?: string
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          base_price_monthly: number
          category: string
          code: string
          created_at: string
          dependencies: string[] | null
          description: string | null
          features: Json | null
          icon: string | null
          id: string
          is_active: boolean
          is_core: boolean
          name: string
          updated_at: string
        }
        Insert: {
          base_price_monthly?: number
          category: string
          code: string
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_core?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          base_price_monthly?: number
          category?: string
          code?: string
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_core?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      monitoring_incidents: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_resolution: string | null
          id: string
          impact_description: string | null
          metadata: Json | null
          org_id: string
          resolution_notes: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_resolution?: string | null
          id?: string
          impact_description?: string | null
          metadata?: Json | null
          org_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_resolution?: string | null
          id?: string
          impact_description?: string | null
          metadata?: Json | null
          org_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["incident_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      monitoring_metrics: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_type: Database["public"]["Enums"]["monitoring_metric_type"]
          metric_unit: string | null
          metric_value: number
          org_id: string
          tags: Json | null
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_type: Database["public"]["Enums"]["monitoring_metric_type"]
          metric_unit?: string | null
          metric_value: number
          org_id: string
          tags?: Json | null
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_type?: Database["public"]["Enums"]["monitoring_metric_type"]
          metric_unit?: string | null
          metric_value?: number
          org_id?: string
          tags?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
      network_monitoring: {
        Row: {
          checked_at: string
          created_at: string
          endpoint_url: string
          error_message: string | null
          id: string
          is_available: boolean | null
          org_id: string
          response_time_ms: number | null
          status_code: number | null
        }
        Insert: {
          checked_at?: string
          created_at?: string
          endpoint_url: string
          error_message?: string | null
          id?: string
          is_available?: boolean | null
          org_id: string
          response_time_ms?: number | null
          status_code?: number | null
        }
        Update: {
          checked_at?: string
          created_at?: string
          endpoint_url?: string
          error_message?: string | null
          id?: string
          is_available?: boolean | null
          org_id?: string
          response_time_ms?: number | null
          status_code?: number | null
        }
        Relationships: []
      }
      night_audit_sessions: {
        Row: {
          audit_date: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          hotel_date_after: string | null
          hotel_date_before: string
          id: string
          notes: string | null
          org_id: string
          post_audit_data: Json | null
          pre_audit_data: Json
          started_at: string
          started_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          audit_date: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          hotel_date_after?: string | null
          hotel_date_before: string
          id?: string
          notes?: string | null
          org_id?: string
          post_audit_data?: Json | null
          pre_audit_data?: Json
          started_at?: string
          started_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          audit_date?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          hotel_date_after?: string | null
          hotel_date_before?: string
          id?: string
          notes?: string | null
          org_id?: string
          post_audit_data?: Json | null
          pre_audit_data?: Json
          started_at?: string
          started_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          context_id: string | null
          context_type: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          org_id: string
          priority: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          org_id: string
          priority?: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          context_id?: string | null
          context_type?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          org_id?: string
          priority?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          estimated_completion_time: string | null
          id: string
          notes: string | null
          order_id: string
          org_id: string
          status: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          estimated_completion_time?: string | null
          id?: string
          notes?: string | null
          order_id: string
          org_id?: string
          status: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          estimated_completion_time?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          org_id?: string
          status?: string
        }
        Relationships: []
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
      organization_modules: {
        Row: {
          activated_at: string
          created_at: string
          custom_price: number | null
          deactivated_at: string | null
          deployment_type_id: string
          id: string
          is_active: boolean
          module_id: string
          org_id: string
          trial_until: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string
          created_at?: string
          custom_price?: number | null
          deactivated_at?: string | null
          deployment_type_id: string
          id?: string
          is_active?: boolean
          module_id: string
          org_id: string
          trial_until?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string
          created_at?: string
          custom_price?: number | null
          deactivated_at?: string | null
          deployment_type_id?: string
          id?: string
          is_active?: boolean
          module_id?: string
          org_id?: string
          trial_until?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_modules_deployment_type_id_fkey"
            columns: ["deployment_type_id"]
            isOneToOne: false
            referencedRelation: "deployment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          org_id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          org_id: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          org_id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      organization_subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          metadata: Json | null
          org_id: string
          plan_id: string
          setup_fee_paid: boolean
          status: string
          trial_end: string | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          metadata?: Json | null
          org_id: string
          plan_id: string
          setup_fee_paid?: boolean
          status?: string
          trial_end?: string | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          metadata?: Json | null
          org_id?: string
          plan_id?: string
          setup_fee_paid?: boolean
          status?: string
          trial_end?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
          split_bill_id: string | null
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
          split_bill_id?: string | null
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
          split_bill_id?: string | null
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
      pos_action_logs: {
        Row: {
          action_type: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          org_id: string
          reason: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          org_id: string
          reason?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string
          reason?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pos_auth_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          org_id: string
          outlet_id: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          org_id: string
          outlet_id?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          org_id?: string
          outlet_id?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      pos_categories: {
        Row: {
          code: string
          color: string | null
          created_at: string
          description: string | null
          family_id: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          outlet_id: string | null
          sort_order: number | null
          subfamily_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string
          description?: string | null
          family_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          outlet_id?: string | null
          sort_order?: number | null
          subfamily_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string
          description?: string | null
          family_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          outlet_id?: string | null
          sort_order?: number | null
          subfamily_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_categories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "pos_families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_categories_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "pos_outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_categories_subfamily_id_fkey"
            columns: ["subfamily_id"]
            isOneToOne: false
            referencedRelation: "pos_subfamilies"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_customer_accounts: {
        Row: {
          account_status: string
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string
          created_by: string | null
          credit_limit: number | null
          credit_limit_type: string
          current_balance: number | null
          customer_code: string
          email: string | null
          id: string
          loyalty_card_number: string | null
          name: string
          notes: string | null
          org_id: string
          phone: string | null
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          account_status?: string
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          credit_limit_type?: string
          current_balance?: number | null
          customer_code: string
          email?: string | null
          id?: string
          loyalty_card_number?: string | null
          name: string
          notes?: string | null
          org_id: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: string
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          credit_limit_type?: string
          current_balance?: number | null
          customer_code?: string
          email?: string | null
          id?: string
          loyalty_card_number?: string | null
          name?: string
          notes?: string | null
          org_id?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pos_customer_invoices: {
        Row: {
          created_at: string
          customer_account_id: string
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          order_data: Json
          org_id: string
          paid_amount: number
          remaining_amount: number
          server_id: string | null
          session_id: string | null
          status: string
          table_number: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_account_id: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          order_data?: Json
          org_id: string
          paid_amount?: number
          remaining_amount?: number
          server_id?: string | null
          session_id?: string | null
          status?: string
          table_number?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_account_id?: string
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          order_data?: Json
          org_id?: string
          paid_amount?: number
          remaining_amount?: number
          server_id?: string | null
          session_id?: string | null
          status?: string
          table_number?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_customer_invoices_account"
            columns: ["customer_account_id"]
            isOneToOne: false
            referencedRelation: "pos_customer_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_customer_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          customer_account_id: string
          id: string
          invoice_id: string | null
          is_partial: boolean | null
          notes: string | null
          org_id: string
          payment_date: string
          payment_method: string
          payment_reference: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          customer_account_id: string
          id?: string
          invoice_id?: string | null
          is_partial?: boolean | null
          notes?: string | null
          org_id: string
          payment_date?: string
          payment_method: string
          payment_reference: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_account_id?: string
          id?: string
          invoice_id?: string | null
          is_partial?: boolean | null
          notes?: string | null
          org_id?: string
          payment_date?: string
          payment_method?: string
          payment_reference?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_customer_payments_account"
            columns: ["customer_account_id"]
            isOneToOne: false
            referencedRelation: "pos_customer_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customer_payments_invoice"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "pos_customer_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_customer_statements: {
        Row: {
          closing_balance: number
          created_at: string
          created_by: string | null
          customer_account_id: string
          id: string
          opening_balance: number
          org_id: string
          period_end: string
          period_start: string
          statement_data: Json
          statement_date: string
          total_invoices: number
          total_payments: number
        }
        Insert: {
          closing_balance?: number
          created_at?: string
          created_by?: string | null
          customer_account_id: string
          id?: string
          opening_balance?: number
          org_id: string
          period_end: string
          period_start: string
          statement_data?: Json
          statement_date: string
          total_invoices?: number
          total_payments?: number
        }
        Update: {
          closing_balance?: number
          created_at?: string
          created_by?: string | null
          customer_account_id?: string
          id?: string
          opening_balance?: number
          org_id?: string
          period_end?: string
          period_start?: string
          statement_data?: Json
          statement_date?: string
          total_invoices?: number
          total_payments?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_customer_statements_account"
            columns: ["customer_account_id"]
            isOneToOne: false
            referencedRelation: "pos_customer_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_daily_closures_z: {
        Row: {
          cashier_id: string
          closure_data: Json
          closure_date: string
          closure_signature: string
          compliance_status: string
          created_at: string
          created_by: string | null
          daily_chain_hash: string
          id: string
          is_sealed: boolean
          ntp_server: string | null
          ntp_timestamp: string | null
          org_id: string
          pos_station_id: string
          signature_certificate: string
          signature_timestamp: string
          total_sales_amount: number
          total_tax_amount: number
          total_transactions_count: number
        }
        Insert: {
          cashier_id: string
          closure_data: Json
          closure_date: string
          closure_signature: string
          compliance_status?: string
          created_at?: string
          created_by?: string | null
          daily_chain_hash: string
          id?: string
          is_sealed?: boolean
          ntp_server?: string | null
          ntp_timestamp?: string | null
          org_id: string
          pos_station_id: string
          signature_certificate: string
          signature_timestamp?: string
          total_sales_amount?: number
          total_tax_amount?: number
          total_transactions_count?: number
        }
        Update: {
          cashier_id?: string
          closure_data?: Json
          closure_date?: string
          closure_signature?: string
          compliance_status?: string
          created_at?: string
          created_by?: string | null
          daily_chain_hash?: string
          id?: string
          is_sealed?: boolean
          ntp_server?: string | null
          ntp_timestamp?: string | null
          org_id?: string
          pos_station_id?: string
          signature_certificate?: string
          signature_timestamp?: string
          total_sales_amount?: number
          total_tax_amount?: number
          total_transactions_count?: number
        }
        Relationships: []
      }
      pos_families: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          outlet_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          outlet_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          outlet_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pos_fiscal_certificates: {
        Row: {
          certificate_pem: string
          certificate_type: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          issuer_dn: string
          org_id: string
          private_key_id: string
          revocation_reason: string | null
          revoked_at: string | null
          serial_number: string
          signature_algorithms: string[]
          subject_dn: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          certificate_pem: string
          certificate_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          issuer_dn: string
          org_id: string
          private_key_id: string
          revocation_reason?: string | null
          revoked_at?: string | null
          serial_number: string
          signature_algorithms?: string[]
          subject_dn: string
          valid_from: string
          valid_until: string
        }
        Update: {
          certificate_pem?: string
          certificate_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          issuer_dn?: string
          org_id?: string
          private_key_id?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          serial_number?: string
          signature_algorithms?: string[]
          subject_dn?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      pos_fiscal_events: {
        Row: {
          cashier_id: string | null
          created_at: string
          created_by: string | null
          digital_signature: string
          event_data: Json
          event_hash: string
          event_timestamp: string
          event_type: string
          fiscal_period: string
          id: string
          org_id: string
          pos_station_id: string | null
          previous_hash: string
          reference_id: string
          reference_type: string
          sequence_number: number
          signature_algorithm: string
        }
        Insert: {
          cashier_id?: string | null
          created_at?: string
          created_by?: string | null
          digital_signature: string
          event_data: Json
          event_hash: string
          event_timestamp?: string
          event_type: string
          fiscal_period?: string
          id?: string
          org_id: string
          pos_station_id?: string | null
          previous_hash: string
          reference_id: string
          reference_type: string
          sequence_number: number
          signature_algorithm?: string
        }
        Update: {
          cashier_id?: string | null
          created_at?: string
          created_by?: string | null
          digital_signature?: string
          event_data?: Json
          event_hash?: string
          event_timestamp?: string
          event_type?: string
          fiscal_period?: string
          id?: string
          org_id?: string
          pos_station_id?: string | null
          previous_hash?: string
          reference_id?: string
          reference_type?: string
          sequence_number?: number
          signature_algorithm?: string
        }
        Relationships: []
      }
      pos_keyboard_buttons: {
        Row: {
          button_color: string | null
          button_text: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          keyboard_id: string
          org_id: string
          position_x: number
          position_y: number
          product_id: string | null
          text_color: string | null
          updated_at: string | null
        }
        Insert: {
          button_color?: string | null
          button_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          keyboard_id: string
          org_id: string
          position_x: number
          position_y: number
          product_id?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Update: {
          button_color?: string | null
          button_text?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          keyboard_id?: string
          org_id?: string
          position_x?: number
          position_y?: number
          product_id?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_keyboard_buttons_keyboard_id_fkey"
            columns: ["keyboard_id"]
            isOneToOne: false
            referencedRelation: "pos_keyboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_keyboard_buttons_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "pos_products"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_keyboards: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          layout_type: string
          name: string
          org_id: string
          outlet_id: string | null
          template_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          layout_type?: string
          name: string
          org_id: string
          outlet_id?: string | null
          template_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          layout_type?: string
          name?: string
          org_id?: string
          outlet_id?: string | null
          template_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pos_kitchen_messages: {
        Row: {
          category: string
          color: string | null
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_priority: boolean | null
          message_text: string
          org_id: string
          outlet_id: string | null
          updated_at: string
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_priority?: boolean | null
          message_text: string
          org_id: string
          outlet_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_priority?: boolean | null
          message_text?: string
          org_id?: string
          outlet_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pos_menu_compositions: {
        Row: {
          component_name: string
          component_product_id: string | null
          component_type: string
          created_at: string
          display_order: number | null
          extra_price: number | null
          id: string
          is_default: boolean
          is_required: boolean
          org_id: string
          parent_product_id: string
          updated_at: string
        }
        Insert: {
          component_name: string
          component_product_id?: string | null
          component_type: string
          created_at?: string
          display_order?: number | null
          extra_price?: number | null
          id?: string
          is_default?: boolean
          is_required?: boolean
          org_id: string
          parent_product_id: string
          updated_at?: string
        }
        Update: {
          component_name?: string
          component_product_id?: string | null
          component_type?: string
          created_at?: string
          display_order?: number | null
          extra_price?: number | null
          id?: string
          is_default?: boolean
          is_required?: boolean
          org_id?: string
          parent_product_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pos_menu_items: {
        Row: {
          created_at: string
          custom_description: string | null
          custom_name: string | null
          custom_price: number | null
          display_order: number | null
          id: string
          is_available: boolean
          is_featured: boolean | null
          menu_section_id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          custom_description?: string | null
          custom_name?: string | null
          custom_price?: number | null
          display_order?: number | null
          id?: string
          is_available?: boolean
          is_featured?: boolean | null
          menu_section_id: string
          product_id: string
        }
        Update: {
          created_at?: string
          custom_description?: string | null
          custom_name?: string | null
          custom_price?: number | null
          display_order?: number | null
          id?: string
          is_available?: boolean
          is_featured?: boolean | null
          menu_section_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pos_menu_items_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "pos_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pos_menu_items_section_id"
            columns: ["menu_section_id"]
            isOneToOne: false
            referencedRelation: "pos_menu_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_menu_sections: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_visible: boolean
          menu_id: string
          name: string
          section_config: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean
          menu_id: string
          name: string
          section_config?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean
          menu_id?: string
          name?: string
          section_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pos_menu_sections_menu_id"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "pos_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_menus: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          layout_config: Json
          name: string
          org_id: string
          outlet_id: string
          time_slots: Json | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          layout_config?: Json
          name: string
          org_id: string
          outlet_id: string
          time_slots?: Json | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          layout_config?: Json
          name?: string
          org_id?: string
          outlet_id?: string
          time_slots?: Json | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      pos_mobile_money_transactions: {
        Row: {
          amount: number
          created_at: string
          currency_code: string
          external_reference: string | null
          id: string
          order_id: string
          org_id: string
          payment_method_id: string
          phone_number: string
          provider: string
          provider_response: Json | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency_code?: string
          external_reference?: string | null
          id?: string
          order_id: string
          org_id: string
          payment_method_id: string
          phone_number: string
          provider: string
          provider_response?: Json | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency_code?: string
          external_reference?: string | null
          id?: string
          order_id?: string
          org_id?: string
          payment_method_id?: string
          phone_number?: string
          provider?: string
          provider_response?: Json | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pos_order_items: {
        Row: {
          created_at: string
          discount_amount: number | null
          id: string
          modifiers: Json | null
          order_id: string | null
          product_id: string | null
          quantity: number
          ready_at: string | null
          selected_garnishes: Json | null
          sent_to_kitchen_at: string | null
          special_instructions: string | null
          status: string | null
          tax_amount: number | null
          total_price: number
          unit_price: number
          updated_at: string
          variant_selection: Json | null
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          id?: string
          modifiers?: Json | null
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          ready_at?: string | null
          selected_garnishes?: Json | null
          sent_to_kitchen_at?: string | null
          special_instructions?: string | null
          status?: string | null
          tax_amount?: number | null
          total_price: number
          unit_price: number
          updated_at?: string
          variant_selection?: Json | null
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          id?: string
          modifiers?: Json | null
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          ready_at?: string | null
          selected_garnishes?: Json | null
          sent_to_kitchen_at?: string | null
          special_instructions?: string | null
          status?: string | null
          tax_amount?: number | null
          total_price?: number
          unit_price?: number
          updated_at?: string
          variant_selection?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pos_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "pos_products"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_orders: {
        Row: {
          cashier_id: string | null
          created_at: string
          customer_count: number | null
          discount_amount: number
          fne_error_message: string | null
          fne_invoice_id: string | null
          fne_qr_code: string | null
          fne_reference_number: string | null
          fne_status: string | null
          fne_submitted_at: string | null
          fne_validated_at: string | null
          guest_id: string | null
          id: string
          kitchen_notes: string | null
          order_number: string
          order_type: string
          org_id: string
          outlet_id: string | null
          paid_at: string | null
          ready_at: string | null
          reservation_id: string | null
          room_id: string | null
          sent_to_kitchen_at: string | null
          served_at: string | null
          server_id: string | null
          session_id: string | null
          special_instructions: string | null
          status: string
          subtotal: number
          table_id: string | null
          tax_amount: number
          tip_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          cashier_id?: string | null
          created_at?: string
          customer_count?: number | null
          discount_amount?: number
          fne_error_message?: string | null
          fne_invoice_id?: string | null
          fne_qr_code?: string | null
          fne_reference_number?: string | null
          fne_status?: string | null
          fne_submitted_at?: string | null
          fne_validated_at?: string | null
          guest_id?: string | null
          id?: string
          kitchen_notes?: string | null
          order_number: string
          order_type?: string
          org_id: string
          outlet_id?: string | null
          paid_at?: string | null
          ready_at?: string | null
          reservation_id?: string | null
          room_id?: string | null
          sent_to_kitchen_at?: string | null
          served_at?: string | null
          server_id?: string | null
          session_id?: string | null
          special_instructions?: string | null
          status?: string
          subtotal?: number
          table_id?: string | null
          tax_amount?: number
          tip_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          cashier_id?: string | null
          created_at?: string
          customer_count?: number | null
          discount_amount?: number
          fne_error_message?: string | null
          fne_invoice_id?: string | null
          fne_qr_code?: string | null
          fne_reference_number?: string | null
          fne_status?: string | null
          fne_submitted_at?: string | null
          fne_validated_at?: string | null
          guest_id?: string | null
          id?: string
          kitchen_notes?: string | null
          order_number?: string
          order_type?: string
          org_id?: string
          outlet_id?: string | null
          paid_at?: string | null
          ready_at?: string | null
          reservation_id?: string | null
          room_id?: string | null
          sent_to_kitchen_at?: string | null
          served_at?: string | null
          server_id?: string | null
          session_id?: string | null
          special_instructions?: string | null
          status?: string
          subtotal?: number
          table_id?: string | null
          tax_amount?: number
          tip_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_orders_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "pos_outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "pos_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_outlets: {
        Row: {
          code: string
          created_at: string
          description: string | null
          fiscal_jurisdiction_id: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          outlet_type: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          fiscal_jurisdiction_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          outlet_type?: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          fiscal_jurisdiction_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          outlet_type?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pos_outlets_fiscal_jurisdiction"
            columns: ["fiscal_jurisdiction_id"]
            isOneToOne: false
            referencedRelation: "fiscal_jurisdictions"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_product_compositions: {
        Row: {
          component_product_id: string
          created_at: string | null
          gross_quantity: number
          id: string
          net_quantity: number | null
          notes: string | null
          org_id: string
          parent_product_id: string
          preparation_time: number | null
          quantity: number
          unit: string
          updated_at: string | null
          waste_coefficient: number | null
        }
        Insert: {
          component_product_id: string
          created_at?: string | null
          gross_quantity?: number
          id?: string
          net_quantity?: number | null
          notes?: string | null
          org_id: string
          parent_product_id: string
          preparation_time?: number | null
          quantity?: number
          unit?: string
          updated_at?: string | null
          waste_coefficient?: number | null
        }
        Update: {
          component_product_id?: string
          created_at?: string | null
          gross_quantity?: number
          id?: string
          net_quantity?: number | null
          notes?: string | null
          org_id?: string
          parent_product_id?: string
          preparation_time?: number | null
          quantity?: number
          unit?: string
          updated_at?: string | null
          waste_coefficient?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_product_compositions_component_product_id_fkey"
            columns: ["component_product_id"]
            isOneToOne: false
            referencedRelation: "pos_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_product_compositions_parent_product_id_fkey"
            columns: ["parent_product_id"]
            isOneToOne: false
            referencedRelation: "pos_products"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_product_garnishes: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean
          is_required: boolean
          max_selections: number | null
          name: string
          org_id: string
          outlet_id: string
          parent_product_id: string
          price_addon: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          max_selections?: number | null
          name: string
          org_id: string
          outlet_id: string
          parent_product_id: string
          price_addon?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean
          is_required?: boolean
          max_selections?: number | null
          name?: string
          org_id?: string
          outlet_id?: string
          parent_product_id?: string
          price_addon?: number
          updated_at?: string
        }
        Relationships: []
      }
      pos_products: {
        Row: {
          allergens: Json | null
          barcode: string | null
          base_price: number
          category_id: string | null
          code: string
          conversion_factor_storage: number | null
          conversion_factor_usage: number | null
          cost_price: number | null
          created_at: string
          current_stock: number | null
          description: string | null
          happy_hour_price: number | null
          id: string
          image_url: string | null
          is_active: boolean
          is_composed: boolean | null
          is_for_sale: boolean | null
          is_stock_managed: boolean | null
          kitchen_notes: string | null
          max_price: number | null
          min_price: number | null
          min_stock_level: number | null
          name: string
          org_id: string
          outlet_id: string | null
          preparation_time: number | null
          price_ht: number | null
          price_level_1: number | null
          price_level_2: number | null
          price_level_3: number | null
          promotion_eligible: boolean | null
          service_id: string | null
          sort_order: number | null
          storage_location: string | null
          tax_rate: number | null
          track_stock: boolean | null
          unit_sale: string | null
          unit_storage: string | null
          unit_usage: string | null
          updated_at: string
          variants: Json | null
        }
        Insert: {
          allergens?: Json | null
          barcode?: string | null
          base_price?: number
          category_id?: string | null
          code: string
          conversion_factor_storage?: number | null
          conversion_factor_usage?: number | null
          cost_price?: number | null
          created_at?: string
          current_stock?: number | null
          description?: string | null
          happy_hour_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_composed?: boolean | null
          is_for_sale?: boolean | null
          is_stock_managed?: boolean | null
          kitchen_notes?: string | null
          max_price?: number | null
          min_price?: number | null
          min_stock_level?: number | null
          name: string
          org_id: string
          outlet_id?: string | null
          preparation_time?: number | null
          price_ht?: number | null
          price_level_1?: number | null
          price_level_2?: number | null
          price_level_3?: number | null
          promotion_eligible?: boolean | null
          service_id?: string | null
          sort_order?: number | null
          storage_location?: string | null
          tax_rate?: number | null
          track_stock?: boolean | null
          unit_sale?: string | null
          unit_storage?: string | null
          unit_usage?: string | null
          updated_at?: string
          variants?: Json | null
        }
        Update: {
          allergens?: Json | null
          barcode?: string | null
          base_price?: number
          category_id?: string | null
          code?: string
          conversion_factor_storage?: number | null
          conversion_factor_usage?: number | null
          cost_price?: number | null
          created_at?: string
          current_stock?: number | null
          description?: string | null
          happy_hour_price?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_composed?: boolean | null
          is_for_sale?: boolean | null
          is_stock_managed?: boolean | null
          kitchen_notes?: string | null
          max_price?: number | null
          min_price?: number | null
          min_stock_level?: number | null
          name?: string
          org_id?: string
          outlet_id?: string | null
          preparation_time?: number | null
          price_ht?: number | null
          price_level_1?: number | null
          price_level_2?: number | null
          price_level_3?: number | null
          promotion_eligible?: boolean | null
          service_id?: string | null
          sort_order?: number | null
          storage_location?: string | null
          tax_rate?: number | null
          track_stock?: boolean | null
          unit_sale?: string | null
          unit_storage?: string | null
          unit_usage?: string | null
          updated_at?: string
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "pos_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_products_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "pos_outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_promotions: {
        Row: {
          applicable_categories: string[] | null
          applicable_products: string[] | null
          code: string
          conditions: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_discount: number | null
          min_amount: number | null
          name: string
          org_id: string
          outlet_ids: string[] | null
          type: string
          updated_at: string
          usage_limit: number | null
          used_count: number | null
          valid_from: string
          valid_until: string
          value: number
        }
        Insert: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          code: string
          conditions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_amount?: number | null
          name: string
          org_id: string
          outlet_ids?: string[] | null
          type?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from: string
          valid_until: string
          value: number
        }
        Update: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          code?: string
          conditions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_amount?: number | null
          name?: string
          org_id?: string
          outlet_ids?: string[] | null
          type?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string
          valid_until?: string
          value?: number
        }
        Relationships: []
      }
      pos_sessions: {
        Row: {
          cashier_id: string
          closed_at: string | null
          closing_cash: number | null
          created_at: string
          id: string
          notes: string | null
          opening_cash: number | null
          org_id: string
          outlet_id: string | null
          session_number: string
          started_at: string
          status: string
          total_sales: number | null
          total_transactions: number | null
          updated_at: string
        }
        Insert: {
          cashier_id: string
          closed_at?: string | null
          closing_cash?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          opening_cash?: number | null
          org_id: string
          outlet_id?: string | null
          session_number: string
          started_at?: string
          status?: string
          total_sales?: number | null
          total_transactions?: number | null
          updated_at?: string
        }
        Update: {
          cashier_id?: string
          closed_at?: string | null
          closing_cash?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          opening_cash?: number | null
          org_id?: string
          outlet_id?: string | null
          session_number?: string
          started_at?: string
          status?: string
          total_sales?: number | null
          total_transactions?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_sessions_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "pos_outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_split_bills: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          org_id: string
          original_order_id: string
          payment_status: string
          split_amount: number
          split_items: Json | null
          split_number: number
          split_type: string
          total_splits: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          org_id: string
          original_order_id: string
          payment_status?: string
          split_amount: number
          split_items?: Json | null
          split_number: number
          split_type: string
          total_splits: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          org_id?: string
          original_order_id?: string
          payment_status?: string
          split_amount?: number
          split_items?: Json | null
          split_number?: number
          split_type?: string
          total_splits?: number
          updated_at?: string
        }
        Relationships: []
      }
      pos_stock_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          current_quantity: number
          id: string
          is_active: boolean | null
          message: string | null
          org_id: string
          outlet_id: string
          product_id: string
          stock_item_id: string | null
          threshold_quantity: number | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          current_quantity: number
          id?: string
          is_active?: boolean | null
          message?: string | null
          org_id: string
          outlet_id: string
          product_id: string
          stock_item_id?: string | null
          threshold_quantity?: number | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          current_quantity?: number
          id?: string
          is_active?: boolean | null
          message?: string | null
          org_id?: string
          outlet_id?: string
          product_id?: string
          stock_item_id?: string | null
          threshold_quantity?: number | null
        }
        Relationships: []
      }
      pos_stock_items: {
        Row: {
          average_cost: number | null
          batch_number: string | null
          category: string
          created_at: string
          created_by: string | null
          current_stock: number
          description: string | null
          expiry_date: string | null
          id: string
          is_active: boolean
          item_code: string
          last_cost: number | null
          max_stock_level: number
          min_stock_level: number
          name: string
          org_id: string
          product_id: string | null
          supplier_code: string | null
          supplier_name: string | null
          unit: string
          unit_cost: number | null
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          average_cost?: number | null
          batch_number?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          current_stock?: number
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          item_code: string
          last_cost?: number | null
          max_stock_level?: number
          min_stock_level?: number
          name: string
          org_id: string
          product_id?: string | null
          supplier_code?: string | null
          supplier_name?: string | null
          unit?: string
          unit_cost?: number | null
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          average_cost?: number | null
          batch_number?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          current_stock?: number
          description?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          item_code?: string
          last_cost?: number | null
          max_stock_level?: number
          min_stock_level?: number
          name?: string
          org_id?: string
          product_id?: string | null
          supplier_code?: string | null
          supplier_name?: string | null
          unit?: string
          unit_cost?: number | null
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_stock_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "pos_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_stock_items_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "pos_warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_stock_movements: {
        Row: {
          created_at: string
          id: string
          movement_type: string
          notes: string | null
          org_id: string
          performed_at: string
          performed_by: string | null
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          stock_item_id: string
          total_cost: number | null
          unit_cost: number | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movement_type: string
          notes?: string | null
          org_id: string
          performed_at?: string
          performed_by?: string | null
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          stock_item_id: string
          total_cost?: number | null
          unit_cost?: number | null
          warehouse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movement_type?: string
          notes?: string | null
          org_id?: string
          performed_at?: string
          performed_by?: string | null
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          stock_item_id?: string
          total_cost?: number | null
          unit_cost?: number | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_stock_movements_stock_item_id_fkey"
            columns: ["stock_item_id"]
            isOneToOne: false
            referencedRelation: "pos_stock_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "pos_warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_subfamilies: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          family_id: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          family_id: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          family_id?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_subfamilies_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "pos_families"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_system_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          org_id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          org_id: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          org_id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      pos_table_transfers: {
        Row: {
          from_table_id: string | null
          id: string
          order_id: string
          org_id: string
          to_table_id: string | null
          transfer_reason: string | null
          transferred_at: string
          transferred_by: string | null
        }
        Insert: {
          from_table_id?: string | null
          id?: string
          order_id: string
          org_id: string
          to_table_id?: string | null
          transfer_reason?: string | null
          transferred_at?: string
          transferred_by?: string | null
        }
        Update: {
          from_table_id?: string | null
          id?: string
          order_id?: string
          org_id?: string
          to_table_id?: string | null
          transfer_reason?: string | null
          transferred_at?: string
          transferred_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pos_table_transfers_from_table_id"
            columns: ["from_table_id"]
            isOneToOne: false
            referencedRelation: "pos_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pos_table_transfers_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pos_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pos_table_transfers_to_table_id"
            columns: ["to_table_id"]
            isOneToOne: false
            referencedRelation: "pos_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_tables: {
        Row: {
          capacity: number | null
          created_at: string
          id: string
          is_active: boolean
          org_id: string
          outlet_id: string | null
          position_x: number | null
          position_y: number | null
          shape: string | null
          status: string | null
          table_number: string
          updated_at: string
          zone: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          org_id: string
          outlet_id?: string | null
          position_x?: number | null
          position_y?: number | null
          shape?: string | null
          status?: string | null
          table_number: string
          updated_at?: string
          zone?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          org_id?: string
          outlet_id?: string | null
          position_x?: number | null
          position_y?: number | null
          shape?: string | null
          status?: string | null
          table_number?: string
          updated_at?: string
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_tables_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "pos_outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_users: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          display_name: string
          employee_code: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          org_id: string
          pin_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          display_name: string
          employee_code?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          org_id: string
          pin_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          display_name?: string
          employee_code?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          org_id?: string
          pin_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pos_warehouses: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_main: boolean
          location: string | null
          name: string
          org_id: string
          outlet_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_main?: boolean
          location?: string | null
          name: string
          org_id: string
          outlet_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_main?: boolean
          location?: string | null
          name?: string
          org_id?: string
          outlet_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pricing_shifts: {
        Row: {
          applicable_days: number[]
          created_at: string
          description: string | null
          end_time: string
          id: string
          is_active: boolean
          name: string
          org_id: string
          outlet_id: string | null
          price_level: number
          priority: number
          start_time: string
          updated_at: string
        }
        Insert: {
          applicable_days?: number[]
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          outlet_id?: string | null
          price_level: number
          priority?: number
          start_time: string
          updated_at?: string
        }
        Update: {
          applicable_days?: number[]
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          outlet_id?: string | null
          price_level?: number
          priority?: number
          start_time?: string
          updated_at?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          last_seen_at: string | null
          phone: string | null
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_seen_at?: string | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_seen_at?: string | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promotional_periods: {
        Row: {
          applicable_categories: string[] | null
          applicable_days: number[]
          applicable_products: string[] | null
          created_at: string
          created_by: string | null
          customer_types: string[] | null
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          end_time: string | null
          id: string
          is_active: boolean
          max_discount_amount: number | null
          min_purchase_amount: number | null
          name: string
          org_id: string
          priority: number
          start_date: string
          start_time: string | null
          updated_at: string
          usage_count: number
          usage_limit: number | null
        }
        Insert: {
          applicable_categories?: string[] | null
          applicable_days?: number[]
          applicable_products?: string[] | null
          created_at?: string
          created_by?: string | null
          customer_types?: string[] | null
          description?: string | null
          discount_type: string
          discount_value?: number
          end_date: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          name: string
          org_id: string
          priority?: number
          start_date: string
          start_time?: string | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
        }
        Update: {
          applicable_categories?: string[] | null
          applicable_days?: number[]
          applicable_products?: string[] | null
          created_at?: string
          created_by?: string | null
          customer_types?: string[] | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          end_time?: string | null
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          name?: string
          org_id?: string
          priority?: number
          start_date?: string
          start_time?: string | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
        }
        Relationships: []
      }
      promotional_rules: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          org_id: string
          promotional_period_id: string
          rule_action: Json
          rule_conditions: Json
          rule_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          org_id: string
          promotional_period_id: string
          rule_action?: Json
          rule_conditions?: Json
          rule_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          org_id?: string
          promotional_period_id?: string
          rule_action?: Json
          rule_conditions?: Json
          rule_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotional_rules_promotional_period_id_fkey"
            columns: ["promotional_period_id"]
            isOneToOne: false
            referencedRelation: "promotional_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          applicable_room_types: string[] | null
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          label: string
          max_discount: number | null
          min_amount: number | null
          org_id: string
          updated_at: string
          usage_limit: number | null
          used_count: number
          valid_from: string
          valid_until: string
        }
        Insert: {
          applicable_room_types?: string[] | null
          code: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          label: string
          max_discount?: number | null
          min_amount?: number | null
          org_id: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from: string
          valid_until: string
        }
        Update: {
          applicable_room_types?: string[] | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          label?: string
          max_discount?: number | null
          min_amount?: number | null
          org_id?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          attempts: number | null
          created_at: string | null
          id: string
          identifier: string
          window_start: string | null
        }
        Insert: {
          action: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          identifier: string
          window_start?: string | null
        }
        Update: {
          action?: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          identifier?: string
          window_start?: string | null
        }
        Relationships: []
      }
      rate_windows: {
        Row: {
          base_rate: number
          code: string
          created_at: string
          created_by: string | null
          day_conditions: Json
          extra_person_rate: number | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          priority: number
          room_type_id: string | null
          single_rate: number | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          base_rate?: number
          code: string
          created_at?: string
          created_by?: string | null
          day_conditions?: Json
          extra_person_rate?: number | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          priority?: number
          room_type_id?: string | null
          single_rate?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          base_rate?: number
          code?: string
          created_at?: string
          created_by?: string | null
          day_conditions?: Json
          extra_person_rate?: number | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          priority?: number
          room_type_id?: string | null
          single_rate?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      recouche_workflows: {
        Row: {
          arrival_guest_id: string | null
          blocking_issues: Json | null
          checkout_task_id: string | null
          created_at: string
          departure_guest_id: string | null
          departure_time: string | null
          expected_arrival_time: string | null
          id: string
          inspection_task_id: string | null
          maintenance_task_id: string | null
          org_id: string
          quality_approved: boolean | null
          quality_approved_by: string | null
          room_number: string
          special_requests: Json | null
          total_turnaround_time: number | null
          updated_at: string
          workflow_status: string
        }
        Insert: {
          arrival_guest_id?: string | null
          blocking_issues?: Json | null
          checkout_task_id?: string | null
          created_at?: string
          departure_guest_id?: string | null
          departure_time?: string | null
          expected_arrival_time?: string | null
          id?: string
          inspection_task_id?: string | null
          maintenance_task_id?: string | null
          org_id: string
          quality_approved?: boolean | null
          quality_approved_by?: string | null
          room_number: string
          special_requests?: Json | null
          total_turnaround_time?: number | null
          updated_at?: string
          workflow_status?: string
        }
        Update: {
          arrival_guest_id?: string | null
          blocking_issues?: Json | null
          checkout_task_id?: string | null
          created_at?: string
          departure_guest_id?: string | null
          departure_time?: string | null
          expected_arrival_time?: string | null
          id?: string
          inspection_task_id?: string | null
          maintenance_task_id?: string | null
          org_id?: string
          quality_approved?: boolean | null
          quality_approved_by?: string | null
          room_number?: string
          special_requests?: Json | null
          total_turnaround_time?: number | null
          updated_at?: string
          workflow_status?: string
        }
        Relationships: []
      }
      reservation_groups: {
        Row: {
          created_at: string
          created_by: string | null
          group_leader_email: string | null
          group_leader_name: string | null
          group_leader_phone: string | null
          group_name: string
          group_rate: number | null
          id: string
          notes: string | null
          org_id: string
          special_requests: string | null
          total_guests: number
          total_rooms: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          group_leader_email?: string | null
          group_leader_name?: string | null
          group_leader_phone?: string | null
          group_name: string
          group_rate?: number | null
          id?: string
          notes?: string | null
          org_id: string
          special_requests?: string | null
          total_guests?: number
          total_rooms?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          group_leader_email?: string | null
          group_leader_name?: string | null
          group_leader_phone?: string | null
          group_name?: string
          group_rate?: number | null
          id?: string
          notes?: string | null
          org_id?: string
          special_requests?: string | null
          total_guests?: number
          total_rooms?: number
          updated_at?: string
        }
        Relationships: []
      }
      reservation_logs: {
        Row: {
          action_description: string | null
          action_type: string
          id: string
          new_values: Json | null
          old_values: Json | null
          org_id: string
          performed_at: string
          performed_by: string | null
          reservation_id: string
        }
        Insert: {
          action_description?: string | null
          action_type: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          org_id: string
          performed_at?: string
          performed_by?: string | null
          reservation_id: string
        }
        Update: {
          action_description?: string | null
          action_type?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string
          performed_at?: string
          performed_by?: string | null
          reservation_id?: string
        }
        Relationships: []
      }
      reservation_services: {
        Row: {
          arrangement_id: string | null
          billing_condition: string
          created_at: string
          folio_number: number
          id: string
          is_applied: boolean
          org_id: string
          quantity: number
          reservation_id: string
          service_id: string
          total_price: number
          unit_price: number
          updated_at: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          arrangement_id?: string | null
          billing_condition?: string
          created_at?: string
          folio_number?: number
          id?: string
          is_applied?: boolean
          org_id?: string
          quantity?: number
          reservation_id: string
          service_id: string
          total_price?: number
          unit_price?: number
          updated_at?: string
          valid_from: string
          valid_until: string
        }
        Update: {
          arrangement_id?: string | null
          billing_condition?: string
          created_at?: string
          folio_number?: number
          id?: string
          is_applied?: boolean
          org_id?: string
          quantity?: number
          reservation_id?: string
          service_id?: string
          total_price?: number
          unit_price?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          adults: number | null
          allotment_id: string | null
          cancellation_policy_id: string | null
          checked_in_at: string | null
          checked_out_at: string | null
          children: number | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          created_by: string | null
          date_arrival: string
          date_departure: string | null
          discount_amount: number | null
          group_billing_mode: string | null
          group_id: string | null
          guest_id: string | null
          id: string
          is_duplicate_from: string | null
          notes: string | null
          org_id: string
          original_rate: number | null
          planned_time: string | null
          promotion_code: string | null
          rate_total: number | null
          reference: string | null
          room_id: string | null
          source: string | null
          source_reference: string | null
          special_requests: string | null
          status: string
          tariff_id: string | null
          updated_at: string | null
        }
        Insert: {
          adults?: number | null
          allotment_id?: string | null
          cancellation_policy_id?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          children?: number | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          date_arrival: string
          date_departure?: string | null
          discount_amount?: number | null
          group_billing_mode?: string | null
          group_id?: string | null
          guest_id?: string | null
          id?: string
          is_duplicate_from?: string | null
          notes?: string | null
          org_id: string
          original_rate?: number | null
          planned_time?: string | null
          promotion_code?: string | null
          rate_total?: number | null
          reference?: string | null
          room_id?: string | null
          source?: string | null
          source_reference?: string | null
          special_requests?: string | null
          status: string
          tariff_id?: string | null
          updated_at?: string | null
        }
        Update: {
          adults?: number | null
          allotment_id?: string | null
          cancellation_policy_id?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          children?: number | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          date_arrival?: string
          date_departure?: string | null
          discount_amount?: number | null
          group_billing_mode?: string | null
          group_id?: string | null
          guest_id?: string | null
          id?: string
          is_duplicate_from?: string | null
          notes?: string | null
          org_id?: string
          original_rate?: number | null
          planned_time?: string | null
          promotion_code?: string | null
          rate_total?: number | null
          reference?: string | null
          room_id?: string | null
          source?: string | null
          source_reference?: string | null
          special_requests?: string | null
          status?: string
          tariff_id?: string | null
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
            referencedRelation: "rack_data_view"
            referencedColumns: ["room_id"]
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
      security_audit_logs: {
        Row: {
          action: string
          created_at: string
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json
          org_id: string
          resource_id: string | null
          resource_type: string
          risk_score: number
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json
          org_id: string
          resource_id?: string | null
          resource_type: string
          risk_score?: number
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json
          org_id?: string
          resource_id?: string | null
          resource_type?: string
          risk_score?: number
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_policy_notes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          justification: string
          policy_name: string
          policy_type: string
          review_required_by: string | null
          security_level: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          justification: string
          policy_name: string
          policy_type: string
          review_required_by?: string | null
          security_level?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          justification?: string
          policy_name?: string
          policy_type?: string
          review_required_by?: string | null
          security_level?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      server_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          max_tables: number | null
          org_id: string
          server_id: string
          shift_date: string
          shift_end: string | null
          shift_start: string | null
          status: string
          updated_at: string
          zone: string | null
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          max_tables?: number | null
          org_id?: string
          server_id: string
          shift_date?: string
          shift_end?: string | null
          shift_start?: string | null
          status?: string
          updated_at?: string
          zone?: string | null
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          max_tables?: number | null
          org_id?: string
          server_id?: string
          shift_date?: string
          shift_end?: string | null
          shift_start?: string | null
          status?: string
          updated_at?: string
          zone?: string | null
        }
        Relationships: []
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
      spare_parts: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          current_stock: number
          description: string | null
          id: string
          is_active: boolean
          last_restocked_date: string | null
          max_stock_level: number | null
          min_stock_level: number | null
          name: string
          notes: string | null
          org_id: string
          part_code: string
          storage_location: string | null
          supplier: string | null
          supplier_part_number: string | null
          unit: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean
          last_restocked_date?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name: string
          notes?: string | null
          org_id: string
          part_code: string
          storage_location?: string | null
          supplier?: string | null
          supplier_part_number?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean
          last_restocked_date?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name?: string
          notes?: string | null
          org_id?: string
          part_code?: string
          storage_location?: string | null
          supplier?: string | null
          supplier_part_number?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      spare_parts_movements: {
        Row: {
          id: string
          maintenance_request_id: string | null
          movement_type: string
          notes: string | null
          org_id: string
          performed_at: string
          performed_by: string | null
          quantity: number
          reason: string | null
          reference_document: string | null
          spare_part_id: string
          unit_cost: number | null
        }
        Insert: {
          id?: string
          maintenance_request_id?: string | null
          movement_type: string
          notes?: string | null
          org_id: string
          performed_at?: string
          performed_by?: string | null
          quantity: number
          reason?: string | null
          reference_document?: string | null
          spare_part_id: string
          unit_cost?: number | null
        }
        Update: {
          id?: string
          maintenance_request_id?: string | null
          movement_type?: string
          notes?: string | null
          org_id?: string
          performed_at?: string
          performed_by?: string | null
          quantity?: number
          reason?: string | null
          reference_document?: string | null
          spare_part_id?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "spare_parts_movements_spare_part_id_fkey"
            columns: ["spare_part_id"]
            isOneToOne: false
            referencedRelation: "spare_parts"
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
      subscription_plans: {
        Row: {
          created_at: string
          currency_code: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_rooms: number | null
          max_users: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_rooms?: number | null
          max_users?: number | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_rooms?: number | null
          max_users?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscription_usage: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_value: number
          org_id: string
          period_end: string
          period_start: string
          subscription_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_value?: number
          org_id: string
          period_end: string
          period_start: string
          subscription_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: number
          org_id?: string
          period_end?: string
          period_start?: string
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_usage_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "organization_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subsidy_programs: {
        Row: {
          applicable_business_types: Json | null
          applicable_categories: Json | null
          code: string
          collective_organization_id: string
          created_at: string
          daily_limit: number | null
          id: string
          is_active: boolean
          monthly_limit: number | null
          name: string
          org_id: string
          program_type: string
          rules: Json
          updated_at: string
          valid_from: string | null
          valid_until: string | null
          weekly_limit: number | null
        }
        Insert: {
          applicable_business_types?: Json | null
          applicable_categories?: Json | null
          code: string
          collective_organization_id: string
          created_at?: string
          daily_limit?: number | null
          id?: string
          is_active?: boolean
          monthly_limit?: number | null
          name: string
          org_id: string
          program_type: string
          rules?: Json
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          weekly_limit?: number | null
        }
        Update: {
          applicable_business_types?: Json | null
          applicable_categories?: Json | null
          code?: string
          collective_organization_id?: string
          created_at?: string
          daily_limit?: number | null
          id?: string
          is_active?: boolean
          monthly_limit?: number | null
          name?: string
          org_id?: string
          program_type?: string
          rules?: Json
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          weekly_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "subsidy_programs_collective_organization_id_fkey"
            columns: ["collective_organization_id"]
            isOneToOne: false
            referencedRelation: "collective_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_performance: {
        Row: {
          active_connections: number | null
          avg_response_time: number | null
          cpu_usage: number | null
          created_at: string
          database_connections: number | null
          disk_usage: number | null
          error_rate: number | null
          id: string
          memory_usage: number | null
          org_id: string
          request_rate: number | null
          timestamp: string
        }
        Insert: {
          active_connections?: number | null
          avg_response_time?: number | null
          cpu_usage?: number | null
          created_at?: string
          database_connections?: number | null
          disk_usage?: number | null
          error_rate?: number | null
          id?: string
          memory_usage?: number | null
          org_id: string
          request_rate?: number | null
          timestamp?: string
        }
        Update: {
          active_connections?: number | null
          avg_response_time?: number | null
          cpu_usage?: number | null
          created_at?: string
          database_connections?: number | null
          disk_usage?: number | null
          error_rate?: number | null
          id?: string
          memory_usage?: number | null
          org_id?: string
          request_rate?: number | null
          timestamp?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          backup_settings: Json | null
          created_at: string
          general_settings: Json | null
          id: string
          integration_settings: Json | null
          notification_settings: Json | null
          org_id: string
          performance_settings: Json | null
          security_settings: Json | null
          updated_at: string
        }
        Insert: {
          backup_settings?: Json | null
          created_at?: string
          general_settings?: Json | null
          id?: string
          integration_settings?: Json | null
          notification_settings?: Json | null
          org_id: string
          performance_settings?: Json | null
          security_settings?: Json | null
          updated_at?: string
        }
        Update: {
          backup_settings?: Json | null
          created_at?: string
          general_settings?: Json | null
          id?: string
          integration_settings?: Json | null
          notification_settings?: Json | null
          org_id?: string
          performance_settings?: Json | null
          security_settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      table_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          id: string
          notes: string | null
          org_id: string
          server_id: string
          shift_date: string
          status: string
          table_id: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          org_id?: string
          server_id: string
          shift_date?: string
          status?: string
          table_id: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          org_id?: string
          server_id?: string
          shift_date?: string
          status?: string
          table_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tariffs: {
        Row: {
          base_rate: number
          client_type: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_negotiated: boolean
          label: string
          max_nights: number | null
          min_nights: number | null
          org_id: string
          room_types: string[] | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          base_rate?: number
          client_type?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_negotiated?: boolean
          label: string
          max_nights?: number | null
          min_nights?: number | null
          org_id: string
          room_types?: string[] | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          base_rate?: number
          client_type?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_negotiated?: boolean
          label?: string
          max_nights?: number | null
          min_nights?: number | null
          org_id?: string
          room_types?: string[] | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
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
      user_security_settings: {
        Row: {
          created_at: string
          id: string
          last_password_reset_at: string | null
          read_only_until: string | null
          two_factor_enabled: boolean
          two_factor_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_password_reset_at?: string | null
          read_only_until?: string | null
          two_factor_enabled?: boolean
          two_factor_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_password_reset_at?: string | null
          read_only_until?: string | null
          two_factor_enabled?: boolean
          two_factor_method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          dashboard_layout: Json | null
          desktop_notifications: boolean | null
          email_notifications: boolean | null
          id: string
          language: string | null
          notification_frequency: string | null
          notifications_enabled: boolean | null
          org_id: string
          preferences: Json | null
          push_notifications: boolean | null
          sound_notifications: boolean | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dashboard_layout?: Json | null
          desktop_notifications?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          notification_frequency?: string | null
          notifications_enabled?: boolean | null
          org_id: string
          preferences?: Json | null
          push_notifications?: boolean | null
          sound_notifications?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dashboard_layout?: Json | null
          desktop_notifications?: boolean | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          notification_frequency?: string | null
          notifications_enabled?: boolean | null
          org_id?: string
          preferences?: Json | null
          push_notifications?: boolean | null
          sound_notifications?: boolean | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempt_count: number
          created_at: string
          delivered_at: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          id: string
          is_active: boolean
          name: string
          org_id: string
          retry_count: number
          secret_key: string | null
          timeout_seconds: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          retry_count?: number
          secret_key?: string | null
          timeout_seconds?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          retry_count?: number
          secret_key?: string | null
          timeout_seconds?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          error_message: string | null
          execution_logs: Json
          id: string
          input_data: Json
          org_id: string
          output_data: Json
          started_at: string
          status: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          execution_logs?: Json
          id?: string
          input_data?: Json
          org_id: string
          output_data?: Json
          started_at?: string
          status?: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          execution_logs?: Json
          id?: string
          input_data?: Json
          org_id?: string
          output_data?: Json
          started_at?: string
          status?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
          version: number
          workflow_definition: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          org_id: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
          version?: number
          workflow_definition: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          version?: number
          workflow_definition?: Json
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
      housekeeping_tasks_with_staff: {
        Row: {
          actual_duration: number | null
          assigned_staff_name: string | null
          assigned_staff_role: string | null
          assigned_staff_status: string | null
          assigned_to: string | null
          checklist_items: Json | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          estimated_duration: number | null
          guest_status: string | null
          id: string | null
          linen_change_details: Json | null
          notes: string | null
          org_id: string | null
          priority: string | null
          quality_notes: string | null
          quality_score: number | null
          room_number: string | null
          scheduled_start: string | null
          special_instructions: string | null
          started_at: string | null
          status: string | null
          task_type: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      rack_data_view: {
        Row: {
          adults: number | null
          children: number | null
          date_arrival: string | null
          date_departure: string | null
          floor: string | null
          guest_name: string | null
          org_id: string | null
          rate_total: number | null
          reservation_id: string | null
          reservation_reference: string | null
          reservation_status: string | null
          room_id: string | null
          room_number: string | null
          room_status: string | null
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
            referencedRelation: "rack_data_view"
            referencedColumns: ["room_id"]
          },
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
            referencedRelation: "rack_data_view"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "fk_reservations_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations_with_details: {
        Row: {
          adults: number | null
          allotment_id: string | null
          cancellation_policy_id: string | null
          cancellation_policy_label: string | null
          checked_in_at: string | null
          checked_out_at: string | null
          children: number | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          created_by: string | null
          date_arrival: string | null
          date_departure: string | null
          discount_amount: number | null
          group_billing_mode: string | null
          group_id: string | null
          guest_email: string | null
          guest_id: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string | null
          is_duplicate_from: string | null
          notes: string | null
          org_id: string | null
          original_rate: number | null
          planned_time: string | null
          promotion_code: string | null
          rate_total: number | null
          reference: string | null
          room_id: string | null
          room_number: string | null
          room_type: string | null
          source: string | null
          source_reference: string | null
          special_requests: string | null
          status: string | null
          tariff_base_rate: number | null
          tariff_id: string | null
          tariff_label: string | null
          updated_at: string | null
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
            referencedRelation: "rack_data_view"
            referencedColumns: ["room_id"]
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
      room_status_summary: {
        Row: {
          completed_tasks: number | null
          guest_status: string | null
          in_progress_tasks: number | null
          last_task_update: string | null
          org_id: string | null
          pending_tasks: number | null
          room_number: string | null
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
      v_daily_revenue: {
        Row: {
          arrivals: number | null
          avg_room_rate: number | null
          business_date: string | null
          departures: number | null
          occupied_rooms: number | null
          org_id: string | null
          outstanding_balance: number | null
          total_payments: number | null
          total_reservations: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_organization_module: {
        Args: {
          p_deployment_type_code: string
          p_module_code: string
          p_org_id: string
          p_trial_days?: number
        }
        Returns: string
      }
      add_loyalty_points: {
        Args: {
          p_description?: string
          p_guest_id: string
          p_points: number
          p_program_id: string
          p_reference?: string
          p_reservation_id?: string
          p_transaction_type?: string
        }
        Returns: undefined
      }
      assign_housekeeping_task: {
        Args: { staff_id: string; task_id: string }
        Returns: undefined
      }
      assign_table_to_server: {
        Args: {
          p_assigned_by?: string
          p_server_id: string
          p_table_id: string
        }
        Returns: string
      }
      authenticate_pos_user: {
        Args: { p_org_id?: string; p_pin: string }
        Returns: {
          display_name: string
          org_id: string
          outlet_id: string
          role_name: string
          session_token: string
          user_id: string
        }[]
      }
      auto_assign_all_tables_to_server: {
        Args: { p_org_id: string; p_server_id: string }
        Returns: undefined
      }
      calculate_composed_product_cost: {
        Args: { p_product_id: string }
        Returns: number
      }
      calculate_composed_product_cost_with_waste: {
        Args: { p_product_id: string }
        Returns: {
          ingredient_count: number
          total_cost_gross: number
          total_cost_net: number
          total_preparation_time: number
        }[]
      }
      calculate_next_fne_retry: {
        Args: { p_base_delay_minutes?: number; p_retry_count: number }
        Returns: string
      }
      calculate_next_maintenance_date: {
        Args: { equipment_id_param: string }
        Returns: string
      }
      calculate_organization_module_cost: {
        Args: { p_org_id: string }
        Returns: {
          active_modules: Json
          module_count: number
          total_monthly_cost: number
          total_setup_fees: number
        }[]
      }
      calculate_promotional_price: {
        Args: {
          p_base_price: number
          p_customer_type?: string
          p_product_id: string
          p_quantity?: number
        }
        Returns: Json
      }
      calculate_rack_kpis: {
        Args: { p_end_date: string; p_org_id: string; p_start_date: string }
        Returns: Json
      }
      calculate_subsidy_amount: {
        Args: {
          p_base_amount: number
          p_beneficiary_id: string
          p_business_type?: string
        }
        Returns: number
      }
      can_access_view_data: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_guest_access_rate_limit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_security_rate_limit: {
        Args: {
          p_action: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_fne_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_housekeeping_task: {
        Args: {
          actual_duration?: number
          quality_notes?: string
          quality_score?: number
          task_id: string
        }
        Returns: undefined
      }
      complete_night_audit: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      create_fiscal_event: {
        Args: {
          p_cashier_id?: string
          p_event_data: Json
          p_event_type: string
          p_org_id: string
          p_pos_station_id?: string
          p_reference_id: string
          p_reference_type: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_context_id?: string
          p_context_type?: string
          p_expires_at?: string
          p_message: string
          p_metadata?: Json
          p_priority?: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      create_pos_user: {
        Args: {
          p_display_name: string
          p_employee_code?: string
          p_org_id: string
          p_pin: string
          p_role?: string
          p_user_id: string
        }
        Returns: string
      }
      generate_fiscal_archive: {
        Args: {
          p_archive_type: string
          p_org_id: string
          p_period_end: string
          p_period_start: string
        }
        Returns: string
      }
      generate_fiscal_event_hash: {
        Args: {
          p_event_data: Json
          p_event_timestamp: string
          p_event_type: string
          p_previous_hash: string
          p_reference_id: string
          p_reference_type: string
          p_sequence_number: number
        }
        Returns: string
      }
      get_current_pricing_level: {
        Args: { p_outlet_id: string }
        Returns: number
      }
      get_current_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_guest_details_secure: {
        Args: { guest_id: string }
        Returns: {
          address_line1: string
          address_line2: string
          city: string
          country: string
          date_of_birth: string
          document_expiry: string
          document_number: string
          document_type: string
          email: string
          first_name: string
          guest_type: string
          id: string
          last_name: string
          marketing_consent: boolean
          nationality: string
          notes: string
          phone: string
          postal_code: string
          preferences: Json
          special_requests: string
          state_province: string
          tax_id: string
          vip_status: boolean
        }[]
      }
      get_guest_stay_history_secure: {
        Args: { p_guest_id?: string }
        Returns: {
          adults: number
          children: number
          date_arrival: string
          date_departure: string
          email: string
          first_name: string
          guest_id: string
          invoice_number: string
          invoice_total: number
          last_name: string
          nights_count: number
          phone: string
          rate_total: number
          reservation_id: string
          reservation_reference: string
          reservation_status: string
          room_number: string
          room_type: string
        }[]
      }
      get_guests_masked: {
        Args: { limit_count: number; offset_count: number }
        Returns: {
          address_line1: string
          address_line2: string
          city: string
          country: string
          created_at: string
          date_of_birth: string
          document_number: string
          email: string
          first_name: string
          guest_type: string
          id: string
          last_name: string
          org_id: string
          phone: string
          postal_code: string
          preferences: Json
          special_requests: string
          tax_id: string
          updated_at: string
          vip_status: boolean
        }[]
      }
      get_hotel_health_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_response_time: number
          avg_uptime: number
          degraded_hotels: number
          down_hotels: number
          healthy_hotels: number
          total_hotels: number
        }[]
      }
      get_hotel_health_summary_v2: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_response_time: number
          avg_uptime: number
          degraded_hotels: number
          down_hotels: number
          healthy_hotels: number
          total_hotels: number
        }[]
      }
      get_last_fiscal_hash: {
        Args: { p_org_id: string }
        Returns: string
      }
      get_next_fiscal_sequence: {
        Args: { p_org_id: string }
        Returns: number
      }
      get_operational_metrics: {
        Args: { p_from_date?: string; p_org_id?: string; p_to_date?: string }
        Returns: {
          current_value: number
          last_updated: string
          metric_name: string
          percentage_change: number
          previous_value: number
          trend: string
        }[]
      }
      get_organization_settings: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          description: string
          id: string
          is_active: boolean
          org_id: string
          setting_key: string
          setting_value: Json
        }[]
      }
      get_organization_settings_v2: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          description: string
          id: string
          is_active: boolean
          org_id: string
          setting_key: string
          setting_value: Json
        }[]
      }
      get_rack_data_optimized: {
        Args: { p_end_date: string; p_org_id: string; p_start_date: string }
        Returns: Json
      }
      get_reservations_with_details_secure: {
        Args: { p_reservation_id?: string }
        Returns: {
          date_arrival: string
          date_departure: string
          guest_email: string
          guest_id: string
          guest_name: string
          guest_phone: string
          id: string
          rate_total: number
          room_id: string
          room_number: string
          room_type: string
          status: string
        }[]
      }
      get_server_tables: {
        Args: { p_org_id?: string; p_server_id: string }
        Returns: {
          assigned_at: string
          assignment_id: string
          capacity: number
          status: string
          table_id: string
          table_number: string
          zone: string
        }[]
      }
      get_server_tables_v2: {
        Args: { p_org_id?: string; p_server_id: string }
        Returns: {
          assigned_at: string
          assignment_id: string
          capacity: number
          status: string
          table_id: string
          table_number: string
          zone: string
        }[]
      }
      get_user_org_id_for_views: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_permission: {
        Args: { p_permission: string }
        Returns: boolean
      }
      has_role: {
        Args:
          | { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
          | { _role: string; _user_id: string }
        Returns: boolean
      }
      is_user_read_only: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_guest_data_access: {
        Args: {
          access_type: string
          guest_id: string
          sensitive_fields?: string[]
        }
        Returns: undefined
      }
      log_security_event: {
        Args: { p_details?: Json; p_event_type: string; p_severity?: string }
        Returns: undefined
      }
      log_user_activity: {
        Args: {
          p_action: string
          p_description?: string
          p_entity_id?: string
          p_entity_name?: string
          p_entity_type: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      logout_pos_session: {
        Args: { p_session_token: string }
        Returns: undefined
      }
      mark_notification_read: {
        Args: { notification_id: string }
        Returns: undefined
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
          allotment_id: string | null
          cancellation_policy_id: string | null
          checked_in_at: string | null
          checked_out_at: string | null
          children: number | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          created_by: string | null
          date_arrival: string
          date_departure: string | null
          discount_amount: number | null
          group_billing_mode: string | null
          group_id: string | null
          guest_id: string | null
          id: string
          is_duplicate_from: string | null
          notes: string | null
          org_id: string
          original_rate: number | null
          planned_time: string | null
          promotion_code: string | null
          rate_total: number | null
          reference: string | null
          room_id: string | null
          source: string | null
          source_reference: string | null
          special_requests: string | null
          status: string
          tariff_id: string | null
          updated_at: string | null
        }
      }
      pms_search_free_rooms: {
        Args: {
          p_end: string
          p_exclude_room_ids?: string[]
          p_org: string
          p_start: string
        }
        Returns: {
          floor: string
          id: string
          number: string
          status: string
          type: string
        }[]
      }
      pms_validate_move: {
        Args: { p_res: string; p_room: string }
        Returns: {
          ok: boolean
          reason: string
        }[]
      }
      schedule_fne_retry: {
        Args: {
          p_error_code?: string
          p_error_message: string
          p_pending_invoice_id: string
        }
        Returns: boolean
      }
      search_guests_secure: {
        Args: { limit_count?: number; search_term: string }
        Returns: {
          city: string
          country: string
          email: string
          first_name: string
          guest_type: string
          id: string
          last_name: string
          masked_document: string
          phone: string
        }[]
      }
      start_night_audit: {
        Args: { p_audit_date: string }
        Returns: string
      }
      update_audit_checkpoint: {
        Args: {
          p_checkpoint_id: string
          p_data?: Json
          p_error_message?: string
          p_status: string
        }
        Returns: boolean
      }
      update_customer_loyalty_tier: {
        Args: { p_guest_id: string; p_program_id: string }
        Returns: undefined
      }
      upsert_organization_setting: {
        Args: { setting_key: string; setting_value: Json }
        Returns: Json
      }
      validate_index_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          estimated_improvement: string
          index_name: string
          table_name: string
        }[]
      }
      validate_payment_amount: {
        Args: { p_amount: number; p_currency_code?: string }
        Returns: boolean
      }
      validate_pos_session: {
        Args: { p_session_token: string }
        Returns: {
          display_name: string
          org_id: string
          outlet_id: string
          role_name: string
          user_id: string
        }[]
      }
      validate_table_function_access: {
        Args:
          | {
              p_function_name: string
              p_org_id?: string
              p_required_role?: string
            }
          | { p_function_name: string; p_org_id?: string; p_user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      alert_severity: "info" | "warning" | "error" | "critical"
      alert_status: "active" | "acknowledged" | "resolved" | "muted"
      app_role:
        | "admin"
        | "manager"
        | "staff"
        | "user"
        | "super_admin"
        | "receptionist"
        | "accountant"
        | "housekeeping"
        | "pos_server"
        | "pos_cashier"
        | "pos_manager"
        | "pos_hostess"
      incident_status: "open" | "investigating" | "monitoring" | "resolved"
      monitoring_metric_type:
        | "system"
        | "application"
        | "network"
        | "business"
        | "database"
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
      alert_severity: ["info", "warning", "error", "critical"],
      alert_status: ["active", "acknowledged", "resolved", "muted"],
      app_role: [
        "admin",
        "manager",
        "staff",
        "user",
        "super_admin",
        "receptionist",
        "accountant",
        "housekeeping",
        "pos_server",
        "pos_cashier",
        "pos_manager",
        "pos_hostess",
      ],
      incident_status: ["open", "investigating", "monitoring", "resolved"],
      monitoring_metric_type: [
        "system",
        "application",
        "network",
        "business",
        "database",
      ],
    },
  },
} as const
