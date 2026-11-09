export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PricingModel = "free" | "freemium" | "paid" | "one_time";

export type ListingStatus = "pending" | "approved" | "rejected";

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          slug: string;
          name: string;
          tagline: string;
          description_short: string;
          description_long: string;
          website_url: string;
          logo_url: string;
          category_id: string;
          pricing_model: PricingModel;
          status: ListingStatus;
          submitted_by_email: string;
          created_at: string;
          updated_at: string;
          approved_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          tagline: string;
          description_short: string;
          description_long: string;
          website_url: string;
          logo_url: string;
          category_id: string;
          pricing_model: PricingModel;
          status?: ListingStatus;
          submitted_by_email: string;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          tagline?: string;
          description_short?: string;
          description_long?: string;
          website_url?: string;
          logo_url?: string;
          category_id?: string;
          pricing_model?: PricingModel;
          status?: ListingStatus;
          submitted_by_email?: string;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      listing_screenshots: {
        Row: {
          id: string;
          listing_id: string;
          url: string;
          position: number;
        };
        Insert: {
          id?: string;
          listing_id: string;
          url: string;
          position: number;
        };
        Update: {
          id?: string;
          listing_id?: string;
          url?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "listing_screenshots_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          id: string;
          event_name: string;
          listing_id: string | null;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_name: string;
          listing_id?: string | null;
          payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_name?: string;
          listing_id?: string | null;
          payload?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      pricing_model: PricingModel;
      listing_status: ListingStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
export type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"];
export type ListingUpdate = Database["public"]["Tables"]["listings"]["Update"];

export type ListingScreenshotRow = Database["public"]["Tables"]["listing_screenshots"]["Row"];
export type ListingScreenshotInsert = Database["public"]["Tables"]["listing_screenshots"]["Insert"];

