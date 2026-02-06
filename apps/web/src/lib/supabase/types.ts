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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
