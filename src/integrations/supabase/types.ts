export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          business_phone: string | null
          calendar_event_id: string | null
          company: string | null
          created_at: string
          custom_recurrence_end_date: string | null
          custom_recurrence_ends: string | null
          custom_recurrence_interval: number | null
          custom_recurrence_occurrences: number | null
          custom_recurrence_unit: string | null
          email: string | null
          facebook_url: string | null
          friendship_score: number | null
          full_name: string
          gift_ideas: string[] | null
          id: string
          instagram_url: string | null
          job_title: string | null
          last_contact: string | null
          last_reminder_completed: string | null
          linkedin_url: string | null
          mobile_phone: string | null
          next_reminder: string | null
          note_version: number | null
          notes: Json[] | null
          preferred_reminder_day: number | null
          related_contacts: string[] | null
          reminder_frequency: string | null
          reminder_status: string | null
          scheduled_followup: string | null
          status: string | null
          tags: string[] | null
          twitter_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          business_phone?: string | null
          calendar_event_id?: string | null
          company?: string | null
          created_at?: string
          custom_recurrence_end_date?: string | null
          custom_recurrence_ends?: string | null
          custom_recurrence_interval?: number | null
          custom_recurrence_occurrences?: number | null
          custom_recurrence_unit?: string | null
          email?: string | null
          facebook_url?: string | null
          friendship_score?: number | null
          full_name: string
          gift_ideas?: string[] | null
          id?: string
          instagram_url?: string | null
          job_title?: string | null
          last_contact?: string | null
          last_reminder_completed?: string | null
          linkedin_url?: string | null
          mobile_phone?: string | null
          next_reminder?: string | null
          note_version?: number | null
          notes?: Json[] | null
          preferred_reminder_day?: number | null
          related_contacts?: string[] | null
          reminder_frequency?: string | null
          reminder_status?: string | null
          scheduled_followup?: string | null
          status?: string | null
          tags?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          business_phone?: string | null
          calendar_event_id?: string | null
          company?: string | null
          created_at?: string
          custom_recurrence_end_date?: string | null
          custom_recurrence_ends?: string | null
          custom_recurrence_interval?: number | null
          custom_recurrence_occurrences?: number | null
          custom_recurrence_unit?: string | null
          email?: string | null
          facebook_url?: string | null
          friendship_score?: number | null
          full_name?: string
          gift_ideas?: string[] | null
          id?: string
          instagram_url?: string | null
          job_title?: string | null
          last_contact?: string | null
          last_reminder_completed?: string | null
          linkedin_url?: string | null
          mobile_phone?: string | null
          next_reminder?: string | null
          note_version?: number | null
          notes?: Json[] | null
          preferred_reminder_day?: number | null
          related_contacts?: string[] | null
          reminder_frequency?: string | null
          reminder_status?: string | null
          scheduled_followup?: string | null
          status?: string | null
          tags?: string[] | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          end_time: string
          guests: string[] | null
          id: string
          location: string | null
          meeting_link: string | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          guests?: string[] | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          guests?: string[] | null
          id?: string
          location?: string | null
          meeting_link?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          feedback: string
          id: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feedback: string
          id?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feedback?: string
          id?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      landing_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          calendar_id: string | null
          created_at: string
          full_name: string | null
          google_refresh_token: string | null
          id: string
          onboarded: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          calendar_id?: string | null
          created_at?: string
          full_name?: string | null
          google_refresh_token?: string | null
          id: string
          onboarded?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          calendar_id?: string | null
          created_at?: string
          full_name?: string | null
          google_refresh_token?: string | null
          id?: string
          onboarded?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      refresh_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
