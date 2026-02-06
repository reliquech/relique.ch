export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      marketplace_items: {
        Row: {
          id: string;
          entity_type: string;
          slug: string;
          sku: string;
          state: Json;
          listing: Json;
          jersey: Json;
          signing: Json;
          condition: Json;
          auth: Json;
          refs: Json | null;
          media: Json | null;
          state_lifecycle: string | null;
          state_visibility: string | null;
          featured_is: boolean | null;
          featured_order: number | null;
          publish_at: string | null;
          created_at: string | null;
          updated_at: string | null;
          created_by: string | null;
          listing_title: string | null;
          listing_category: string | null;
          price_amount: number | null;
          price_currency: string | null;
        };
        Insert: {
          id?: string;
          entity_type: string;
          slug: string;
          sku: string;
          state: Json;
          listing: Json;
          jersey: Json;
          signing: Json;
          condition: Json;
          auth: Json;
          refs?: Json | null;
          media?: Json | null;
        };
        Update: {
          id?: string;
          entity_type?: string;
          slug?: string;
          sku?: string;
          state?: Json;
          listing?: Json;
          jersey?: Json;
          signing?: Json;
          condition?: Json;
          auth?: Json;
          refs?: Json | null;
          media?: Json | null;
        };
      };
      consigned_items: {
        Row: {
          id: string;
          marketplace_item_id: string | null;
          contact_name: string;
          contact_email: string;
          contact_phone: string | null;
          contact_address: string | null;
          item_description: string;
          category: string | null;
          estimated_value: number | null;
          appraisal_date: string | null;
          coa_issuer: string | null;
          verification_status: string | null;
          commission_rate: number | null;
          listing_fee: number | null;
          contract_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          marketplace_item_id?: string | null;
          contact_name: string;
          contact_email: string;
          contact_phone?: string | null;
          contact_address?: string | null;
          item_description: string;
          category?: string | null;
          estimated_value?: number | null;
          appraisal_date?: string | null;
          coa_issuer?: string | null;
          verification_status?: string | null;
          commission_rate?: number | null;
          listing_fee?: number | null;
          contract_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          marketplace_item_id?: string | null;
          contact_name?: string;
          contact_email?: string;
          contact_phone?: string | null;
          contact_address?: string | null;
          item_description?: string;
          category?: string | null;
          estimated_value?: number | null;
          appraisal_date?: string | null;
          coa_issuer?: string | null;
          verification_status?: string | null;
          commission_rate?: number | null;
          listing_fee?: number | null;
          contract_date?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          message: string;
          metadata: Json | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          message: string;
          metadata?: Json | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          message?: string;
          metadata?: Json | null;
          read_at?: string | null;
          created_at?: string;
        };
      };
      alert_rules: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          entity_type: string | null;
          condition_type: string;
          condition_params: Json | null;
          conditions: Json | null;
          action_type: string;
          action_params: Json | null;
          enabled: boolean;
          last_triggered_at: string | null;
          cooldown_hours: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          entity_type?: string | null;
          condition_type: string;
          condition_params?: Json | null;
          conditions?: Json | null;
          action_type?: string;
          action_params?: Json | null;
          enabled?: boolean;
          last_triggered_at?: string | null;
          cooldown_hours?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          entity_type?: string | null;
          condition_type?: string;
          condition_params?: Json | null;
          conditions?: Json | null;
          action_type?: string;
          action_params?: Json | null;
          enabled?: boolean;
          last_triggered_at?: string | null;
          cooldown_hours?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      crm_custom_fields: {
        Row: {
          id: string;
          entity_type: string;
          name: string;
          key: string;
          field_type: string;
          options: Json | null;
          required: boolean;
          position: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          name: string;
          key: string;
          field_type: string;
          options?: Json | null;
          required?: boolean;
          position?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          name?: string;
          key?: string;
          field_type?: string;
          options?: Json | null;
          required?: boolean;
          position?: number;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      crm_custom_field_values: {
        Row: {
          id: string;
          field_id: string;
          entity_type: string;
          entity_id: string;
          value_json: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          field_id: string;
          entity_type: string;
          entity_id: string;
          value_json?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          field_id?: string;
          entity_type?: string;
          entity_id?: string;
          value_json?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notification_preferences: {
        Row: {
          user_id: string;
          in_app_enabled: boolean;
          email_enabled: boolean;
          type_preferences: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          in_app_enabled?: boolean;
          email_enabled?: boolean;
          type_preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          in_app_enabled?: boolean;
          email_enabled?: boolean;
          type_preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      crm_saved_views: {
        Row: {
          id: string;
          user_id: string;
          entity_type: string;
          name: string;
          state: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_type: string;
          name: string;
          state: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity_type?: string;
          name?: string;
          state?: Json;
          created_at?: string;
        };
      };
      crm_saved_filters: {
        Row: {
          id: string;
          user_id: string;
          entity_type: string;
          name: string;
          query: string | null;
          filters: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_type: string;
          name: string;
          query?: string | null;
          filters?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity_type?: string;
          name?: string;
          query?: string | null;
          filters?: Json | null;
          created_at?: string;
        };
      };
      crm_recent_searches: {
        Row: {
          id: string;
          user_id: string;
          entity_type: string;
          query: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_type: string;
          query: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity_type?: string;
          query?: string;
          created_at?: string;
        };
      };
      email_logs: {
        Row: {
          id: string;
          user_id: string;
          entity_type: string;
          entity_id: string;
          to_email: string;
          subject: string;
          body: string | null;
          provider: string;
          provider_message_id: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_type: string;
          entity_id: string;
          to_email: string;
          subject: string;
          body?: string | null;
          provider?: string;
          provider_message_id?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity_type?: string;
          entity_id?: string;
          to_email?: string;
          subject?: string;
          body?: string | null;
          provider?: string;
          provider_message_id?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          due_at: string | null;
          entity_type: string | null;
          entity_id: string | null;
          assigned_to: string | null;
          created_by: string | null;
          source_rule_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_at?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          source_rule_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_at?: string | null;
          entity_type?: string | null;
          entity_id?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          source_rule_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      crm_dashboard_summary: {
        Args: {
          start_date: string;
          end_date: string;
        };
        Returns: Array<{
          new_customers: number;
          new_leads: number;
          new_messages: number;
          open_deals: number;
          won_deals: number;
          lost_deals: number;
          pipeline_value: number;
          pipeline_open_value: number;
        }>;
      };
      crm_activity_series: {
        Args: {
          start_date: string;
          end_date: string;
        };
        Returns: Array<{
          date: string;
          new_leads: number;
          new_deals: number;
          new_messages: number;
        }>;
      };
      crm_funnel_summary: {
        Args: {
          start_date: string;
          end_date: string;
        };
        Returns: Array<{
          leads_created: number;
          deals_created: number;
          deals_won: number;
        }>;
      };
      crm_lead_source_performance: {
        Args: {
          start_date: string;
          end_date: string;
        };
        Returns: Array<{
          source: string;
          lead_count: number;
          converted_count: number;
        }>;
      };
      crm_deal_aging: {
        Args: {
          start_date: string;
          end_date: string;
        };
        Returns: Array<{
          bucket: string;
          deal_count: number;
          total_value: number;
        }>;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
