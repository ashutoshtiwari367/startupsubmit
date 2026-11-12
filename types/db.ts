export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PricingModel = "free" | "freemium" | "premium" | "paid" | "one_time";

export type BillingPeriod = "monthly" | "yearly" | "one_time";

export type ListingPlan = "free" | "premium" | "featured" | "freemium" | "paid" | "one_time";

export type ListingStatus = "pending" | "approved" | "rejected";

export type ReviewStatus = "pending" | "approved" | "rejected";
export type CommentStatus = "pending" | "approved" | "hidden" | "rejected";
export type AnalyticsEventType = "view" | "website_click";

export type BigIntId = number | string;

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number;
          slug: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          slug: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          slug?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: number;
          slug: string;
          name: string;
          tagline: string;
          description_short: string;
          description_long: string;
          website_url: string;
          logo_url: string;
          category_id: number;
          custom_category?: string | null;
          pricing_model: PricingModel;
          starting_price?: number | null;
          currency?: string;
          billing_period?: BillingPeriod | null;
          listing_plan?: ListingPlan;
          listing_plan_price?: number;
          status: ListingStatus;
          submitted_by_email: string;
          created_at: string;
          updated_at: string;
          approved_at: string | null;
        };
        Insert: {
          id?: never;
          slug: string;
          name: string;
          tagline: string;
          description_short: string;
          description_long: string;
          website_url?: string;
          logo_url: string;
          category_id: number;
          custom_category?: string | null;
          pricing_model: PricingModel;
          starting_price?: number | null;
          currency?: string;
          billing_period?: BillingPeriod | null;
          listing_plan?: ListingPlan;
          listing_plan_price?: number;
          status?: ListingStatus;
          submitted_by_email: string;
          created_at?: string;
          updated_at?: string;
          approved_at?: string | null;
        };
        Update: {
          id?: never;
          slug?: string;
          name?: string;
          tagline?: string;
          description_short?: string;
          description_long?: string;
          website_url?: string;
          logo_url?: string;
          category_id?: number;
          custom_category?: string | null;
          pricing_model?: PricingModel;
          starting_price?: number | null;
          currency?: string;
          billing_period?: BillingPeriod | null;
          listing_plan?: ListingPlan;
          listing_plan_price?: number;
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
          id: number;
          listing_id: number;
          url: string;
          position: number;
        };
        Insert: {
          id?: never;
          listing_id: number;
          url: string;
          position: number;
        };
        Update: {
          id?: never;
          listing_id?: number;
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
      profiles: {
        Row: {
          id: string;
          cust_id_ext: number;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          cust_id_ext?: never;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cust_id_ext?: never;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: number;
          event_name: string;
          listing_id: number | null;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: never;
          event_name: string;
          listing_id?: number | null;
          payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: never;
          event_name?: string;
          listing_id?: number | null;
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
      plans: {
        Row: {
          id: ListingPlan;
          name: string;
          description: string | null;
          price: number;
          price_minor: number;
          currency: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: ListingPlan;
          name: string;
          description?: string | null;
          price: number;
          price_minor: number;
          currency?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: ListingPlan;
          name?: string;
          description?: string | null;
          price?: number;
          price_minor?: number;
          currency?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: number;
          user_id: string | null;
          plan_id: ListingPlan | null;
          listing_id: number | null;
          razorpay_order_id: string;
          razorpay_payment_id: string | null;
          amount: number;
          currency: string;
          status: "created" | "paid" | "failed";
          payer_email: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          user_id?: string | null;
          plan_id?: ListingPlan | null;
          listing_id?: number | null;
          razorpay_order_id: string;
          razorpay_payment_id?: string | null;
          amount: number;
          currency?: string;
          status?: "created" | "paid" | "failed";
          payer_email?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          user_id?: string | null;
          plan_id?: ListingPlan | null;
          listing_id?: number | null;
          razorpay_order_id?: string;
          razorpay_payment_id?: string | null;
          amount?: number;
          currency?: string;
          status?: "created" | "paid" | "failed";
          payer_email?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_gateway_events: {
        Row: {
          id: number;
          razorpay_event_id: string | null;
          event_type: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          payment_id: number | null;
          signature_valid: boolean;
          payload: Json;
          processing_result: string | null;
          received_at: string;
        };
        Insert: {
          id?: never;
          razorpay_event_id?: string | null;
          event_type: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          payment_id?: number | null;
          signature_valid: boolean;
          payload: Json;
          processing_result?: string | null;
          received_at?: string;
        };
        Update: {
          id?: never;
          razorpay_event_id?: string | null;
          event_type?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          payment_id?: number | null;
          signature_valid?: boolean;
          payload?: Json;
          processing_result?: string | null;
          received_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          }
        ];
      };
      listing_analytics: {
        Row: {
          id: number;
          listing_id: number;
          event_type: AnalyticsEventType;
          session_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          listing_id: number;
          event_type: AnalyticsEventType;
          session_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          listing_id?: number;
          event_type?: AnalyticsEventType;
          session_hash?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_analytics_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      listing_reviews: {
        Row: {
          id: number;
          listing_id: number;
          user_id: string;
          rating: number;
          review_text: string;
          status: ReviewStatus;
          helpful_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          listing_id: number;
          user_id: string;
          rating: number;
          review_text: string;
          status?: ReviewStatus;
          helpful_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          listing_id?: number;
          user_id?: string;
          rating?: number;
          review_text?: string;
          status?: ReviewStatus;
          helpful_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_reviews_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      listing_review_helpful: {
        Row: {
          id: number;
          review_id: number;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: never;
          review_id: number;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: never;
          review_id?: number;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_review_helpful_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "listing_reviews";
            referencedColumns: ["id"];
          }
        ];
      };
      listing_comments: {
        Row: {
          id: number;
          listing_id: number;
          user_id: string;
          parent_comment_id: number | null;
          comment_text: string;
          status: CommentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          listing_id: number;
          user_id: string;
          parent_comment_id?: number | null;
          comment_text: string;
          status?: CommentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: never;
          listing_id?: number;
          user_id?: string;
          parent_comment_id?: number | null;
          comment_text?: string;
          status?: CommentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_comments_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };
      listing_review_reports: {
        Row: {
          id: number;
          review_id: number;
          reporter_id: string;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: never;
          review_id: number;
          reporter_id: string;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: never;
          review_id?: number;
          reporter_id?: string;
          reason?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_review_reports_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "listing_reviews";
            referencedColumns: ["id"];
          }
        ];
      };
      listing_comment_reports: {
        Row: {
          id: number;
          comment_id: number;
          reporter_id: string;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: never;
          comment_id: number;
          reporter_id: string;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: never;
          comment_id?: number;
          reporter_id?: string;
          reason?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_comment_reports_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "listing_comments";
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

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type PlanRow = Database["public"]["Tables"]["plans"]["Row"];
export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentGatewayEventRow =
  Database["public"]["Tables"]["payment_gateway_events"]["Row"];

export type ListingAnalyticsRow = Database["public"]["Tables"]["listing_analytics"]["Row"];
export type ListingReviewRow = Database["public"]["Tables"]["listing_reviews"]["Row"];
export type ListingCommentRow = Database["public"]["Tables"]["listing_comments"]["Row"];
export type ListingReviewReportRow = Database["public"]["Tables"]["listing_review_reports"]["Row"];
export type ListingCommentReportRow = Database["public"]["Tables"]["listing_comment_reports"]["Row"];
