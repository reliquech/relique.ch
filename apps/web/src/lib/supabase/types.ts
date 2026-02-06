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
          slug: string;
          title: string;
          description: string;
          full_description: string | null;
          price_usd: number;
          currency: string;
          image: string;
          images: Json | null;
          metadata: Json | null;
          category: string;
          status: string;
          authenticated: boolean;
          certificate: string | null;
          authenticated_date: string | null;
          coa_issuer: string | null;
          signed_by: string | null;
          condition: string | null;
          provenance: string | null;
          seller_name: string | null;
          seller_rating: number | null;
          seller_verified: boolean | null;
          is_featured: boolean;
          featured_order: number | null;
          commission_rate: number | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description: string;
          full_description?: string | null;
          price_usd: number;
          currency?: string;
          image: string;
          images?: Json | null;
          metadata?: Json | null;
          category: string;
          status?: string;
          authenticated?: boolean;
          certificate?: string | null;
          authenticated_date?: string | null;
          coa_issuer?: string | null;
          signed_by?: string | null;
          condition?: string | null;
          provenance?: string | null;
          seller_name?: string | null;
          seller_rating?: number | null;
          seller_verified?: boolean | null;
          is_featured?: boolean;
          featured_order?: number | null;
          commission_rate?: number | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          full_description?: string | null;
          price_usd?: number;
          currency?: string;
          image?: string;
          images?: Json | null;
          metadata?: Json | null;
          category?: string;
          status?: string;
          authenticated?: boolean;
          certificate?: string | null;
          authenticated_date?: string | null;
          coa_issuer?: string | null;
          signed_by?: string | null;
          condition?: string | null;
          provenance?: string | null;
          seller_name?: string | null;
          seller_rating?: number | null;
          seller_verified?: boolean | null;
          is_featured?: boolean;
          featured_order?: number | null;
          commission_rate?: number | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
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
