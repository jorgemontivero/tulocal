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
      categories: {
        Row: {
          id: string;
          name: string;
          business_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          business_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          business_type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      subcategories: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      shops: {
        Row: {
          id: string;
          vendor_id: string;
          name: string;
          slug: string;
          category: string | null;
          business_type: string | null;
          category_id: string | null;
          subcategory_id: string | null;
          whatsapp_number: string | null;
          instagram_username: string | null;
          description: string | null;
          address: string | null;
          logo_url: string | null;
          flyer_urls: Json;
          latitude: number | null;
          longitude: number | null;
          status: string;
          plan_type: string;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          name: string;
          slug: string;
          category?: string | null;
          business_type?: string | null;
          category_id?: string | null;
          subcategory_id?: string | null;
          whatsapp_number?: string | null;
          instagram_username?: string | null;
          description?: string | null;
          address?: string | null;
          logo_url?: string | null;
          flyer_urls?: Json;
          latitude?: number | null;
          longitude?: number | null;
          status?: string;
          plan_type?: string;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          name?: string;
          slug?: string;
          category?: string | null;
          business_type?: string | null;
          category_id?: string | null;
          subcategory_id?: string | null;
          whatsapp_number?: string | null;
          instagram_username?: string | null;
          description?: string | null;
          address?: string | null;
          logo_url?: string | null;
          flyer_urls?: Json;
          latitude?: number | null;
          longitude?: number | null;
          status?: string;
          plan_type?: string;
          is_featured?: boolean;
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
          price: number | null;
          discount_percentage: number | null;
          is_promoted: boolean;
          image_urls: Json;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          shop_id: string;
          title: string;
          description?: string | null;
          price?: number | null;
          discount_percentage?: number | null;
          is_promoted?: boolean;
          image_urls?: Json;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          shop_id?: string;
          title?: string;
          description?: string | null;
          price?: number | null;
          discount_percentage?: number | null;
          is_promoted?: boolean;
          image_urls?: Json;
          status?: string;
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
      shop_events: {
        Row: {
          id: number;
          shop_id: string;
          event_type: string;
          meta: Json;
          created_at: string;
        };
        Insert: {
          id?: never;
          shop_id: string;
          event_type: string;
          meta?: Json;
          created_at?: string;
        };
        Update: {
          shop_id?: string;
          event_type?: string;
          meta?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "shop_events_shop_id_fkey";
            columns: ["shop_id"];
            isOneToOne: false;
            referencedRelation: "shops";
            referencedColumns: ["id"];
          },
        ];
      };
      search_logs: {
        Row: {
          id: number;
          query: string;
          results: number;
          filters: Json;
          created_at: string;
        };
        Insert: {
          id?: never;
          query: string;
          results?: number;
          filters?: Json;
          created_at?: string;
        };
        Update: {
          query?: string;
          results?: number;
          filters?: Json;
        };
        Relationships: [];
      };
      visitor_leads: {
        Row: {
          id: string;
          name: string;
          contact_method: string;
          contact_value: string;
          age_range: string | null;
          gender: string | null;
          wants_promos: boolean;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_method: string;
          contact_value: string;
          age_range?: string | null;
          gender?: string | null;
          wants_promos?: boolean;
          source: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_method?: string;
          contact_value?: string;
          age_range?: string | null;
          gender?: string | null;
          wants_promos?: boolean;
          source?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_and_touch_lead_rate_limit: {
        Args: {
          p_client_ip: string;
          p_max_hits?: number;
          p_window_seconds?: number;
        };
        Returns: boolean;
      };
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
