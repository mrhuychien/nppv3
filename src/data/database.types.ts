export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | "owner"
  | "manager"
  | "accountant"
  | "sales"
  | "warehouse"
  | "driver";

/**
 * Bootstrap subset of the generated Supabase types.
 *
 * Replace this file with `supabase gen types typescript` after the v3 baseline
 * migration is available. Keeping a generated-shaped boundary prevents raw
 * database rows from leaking through the application.
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          org_id: string;
          full_name: string;
          role: UserRole;
          phone: string | null;
          is_active: boolean;
          allow_price_edit: boolean;
          price_edit_max_increase_pct: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      lookup_email_by_identifier: {
        Args: { p_id: string };
        Returns: string | null;
      };
      create_sales_order_v1_compatible: {
        Args: { p_payload: Json; p_idempotency_key?: string | null };
        Returns: Json;
      };
      create_stock_out_bundle: {
        Args: { p_payload: Json; p_idempotency_key?: string | null };
        Returns: Json;
      };
      collect_self_delivery: {
        Args: {
          p_entry_id: string;
          p_payload: Json;
          p_idempotency_key?: string | null;
        };
        Returns: Json;
      };
      post_self_delivery: {
        Args: { p_entry_id: string };
        Returns: Json;
      };
      settle_driver_delivery: {
        Args: {
          p_delivery_id: string;
          p_payload: Json;
          p_idempotency_key?: string | null;
        };
        Returns: Json;
      };
      submit_stocktake: {
        Args: { p_entry_id: string };
        Returns: Json;
      };
      approve_stocktake: {
        Args: {
          p_entry_id: string;
          p_decision: "approved" | "rejected";
          p_reason?: string | null;
        };
        Returns: Json;
      };
      confirm_driver_handover: {
        Args: { p_handover_id: string; p_idempotency_key?: string | null };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
