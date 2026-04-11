export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Tipos del esquema `public` alineados con las tablas desplegadas:
 * columnas verificadas contra PostgREST (proyecto en ejecución; tablas sin filas).
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      shops: {
        Row: {
          id: string;
          vendor_id: string;
          name: string;
          slug: string;
          category: string | null;
          whatsapp_number: string | null;
          instagram_username: string | null;
          description: string | null;
          address: string | null;
          logo_url: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          name: string;
          slug: string;
          category?: string | null;
          whatsapp_number?: string | null;
          instagram_username?: string | null;
          description?: string | null;
          address?: string | null;
          logo_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          name?: string;
          slug?: string;
          category?: string | null;
          whatsapp_number?: string | null;
          instagram_username?: string | null;
          description?: string | null;
          address?: string | null;
          logo_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          shop_id: string;
          title: string;
          description: string | null;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          title: string;
          description?: string | null;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listings_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
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
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;
