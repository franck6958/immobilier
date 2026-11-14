// Généré depuis Supabase (projet ebene-immobilier). Régénérer après chaque modification du schéma.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          owner_id: string;
          property_id: string | null;
          kind: string;
          file_path: string;
          file_name: string;
          mime: string;
          size: number;
          status: string;
          admin_note: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          property_id?: string | null;
          kind: string;
          file_path: string;
          file_name?: string;
          mime?: string;
          size?: number;
          status?: string;
          admin_note?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          property_id?: string | null;
          kind?: string;
          file_path?: string;
          file_name?: string;
          mime?: string;
          size?: number;
          status?: string;
          admin_note?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "documents_owner_id_fkey"; columns: ["owner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "documents_property_id_fkey"; columns: ["property_id"]; isOneToOne: false; referencedRelation: "properties"; referencedColumns: ["id"] },
        ];
      };
      leads: {
        Row: {
          created_at: string;
          data: Json;
          email: string;
          id: string;
          kind: string;
          message: string;
          name: string;
          phone: string;
          property_ref: string | null;
          status: string;
          subject: string;
        };
        Insert: {
          created_at?: string;
          data?: Json;
          email: string;
          id?: string;
          kind: string;
          message?: string;
          name: string;
          phone?: string;
          property_ref?: string | null;
          status?: string;
          subject?: string;
        };
        Update: {
          created_at?: string;
          data?: Json;
          email?: string;
          id?: string;
          kind?: string;
          message?: string;
          name?: string;
          phone?: string;
          property_ref?: string | null;
          status?: string;
          subject?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          phone: string;
          role: string;
          verification_status: string;
          verification_note: string | null;
          verification_submitted_at: string | null;
          verified_at: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id: string;
          phone?: string;
          role?: string;
          verification_status?: string;
          verification_note?: string | null;
          verification_submitted_at?: string | null;
          verified_at?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          phone?: string;
          role?: string;
          verification_status?: string;
          verification_note?: string | null;
          verification_submitted_at?: string | null;
          verified_at?: string | null;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          admin_note: string | null;
          agent: number;
          badge: string | null;
          bathrooms: number | null;
          bedrooms: number | null;
          city: string;
          created_at: string;
          description: string;
          district: string;
          features: string[];
          furnished: boolean;
          id: string;
          image_alt: string;
          images: string[];
          land: number | null;
          owner_id: string | null;
          price: number;
          published_at: string | null;
          ref: string;
          slug: string;
          status: string;
          summary: string;
          surface: number;
          title: string;
          transaction: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          admin_note?: string | null;
          agent?: number;
          badge?: string | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          city: string;
          created_at?: string;
          description?: string;
          district?: string;
          features?: string[];
          furnished?: boolean;
          id?: string;
          image_alt?: string;
          images?: string[];
          land?: number | null;
          owner_id?: string | null;
          price: number;
          published_at?: string | null;
          ref: string;
          slug: string;
          status?: string;
          summary?: string;
          surface: number;
          title: string;
          transaction: string;
          type: string;
          updated_at?: string;
        };
        Update: {
          admin_note?: string | null;
          agent?: number;
          badge?: string | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          city?: string;
          created_at?: string;
          description?: string;
          district?: string;
          features?: string[];
          furnished?: boolean;
          id?: string;
          image_alt?: string;
          images?: string[];
          land?: number | null;
          owner_id?: string | null;
          price?: number;
          published_at?: string | null;
          ref?: string;
          slug?: string;
          status?: string;
          summary?: string;
          surface?: number;
          title?: string;
          transaction?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
      is_privileged: { Args: never; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
export type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
