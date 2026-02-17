export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_questions: {
        Row: {
          created_at: string | null
          entry_id: string
          id: string
          options: Json | null
          question_order: number | null
          question_text: string
          question_type: string
        }
        Insert: {
          created_at?: string | null
          entry_id: string
          id?: string
          options?: Json | null
          question_order?: number | null
          question_text: string
          question_type: string
        }
        Update: {
          created_at?: string | null
          entry_id?: string
          id?: string
          options?: Json | null
          question_order?: number | null
          question_text?: string
          question_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_questions_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "food_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_questions_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "v_entry_avg_scores"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "ai_questions_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "v_trip_rankings"
            referencedColumns: ["entry_id"]
          },
        ]
      }
      ai_rankings: {
        Row: {
          generated_at: string | null
          id: string
          ranking_data: Json
          reasoning: string | null
          trip_id: string
          weights_used: Json | null
        }
        Insert: {
          generated_at?: string | null
          id?: string
          ranking_data: Json
          reasoning?: string | null
          trip_id: string
          weights_used?: Json | null
        }
        Update: {
          generated_at?: string | null
          id?: string
          ranking_data?: Json
          reasoning?: string | null
          trip_id?: string
          weights_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_rankings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_responses: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          response_text: string | null
          response_value: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          response_text?: string | null
          response_value?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          response_text?: string | null
          response_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "ai_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      food_entries: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          restaurant_name: string | null
          title: string
          trip_id: string
          updated_at: string | null
          visited_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          restaurant_name?: string | null
          title: string
          trip_id: string
          updated_at?: string | null
          visited_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          restaurant_name?: string | null
          title?: string
          trip_id?: string
          updated_at?: string | null
          visited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_entries_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      food_entry_tags: {
        Row: {
          entry_id: string
          id: string
          is_ai_suggested: boolean | null
          tag_id: string
        }
        Insert: {
          entry_id: string
          id?: string
          is_ai_suggested?: boolean | null
          tag_id: string
        }
        Update: {
          entry_id?: string
          id?: string
          is_ai_suggested?: boolean | null
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_entry_tags_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "food_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_entry_tags_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "v_entry_avg_scores"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "food_entry_tags_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "v_trip_rankings"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "food_entry_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      food_photos: {
        Row: {
          created_at: string | null
          display_order: number | null
          entry_id: string
          id: string
          photo_url: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          entry_id: string
          id?: string
          photo_url: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          entry_id?: string
          id?: string
          photo_url?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_photos_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "food_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_photos_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "v_entry_avg_scores"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "food_photos_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "v_trip_rankings"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "food_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string | null
          entry_id: string
          id: string
          review_text: string | null
          score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entry_id: string
          id?: string
          review_text?: string | null
          score: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entry_id?: string
          id?: string
          review_text?: string | null
          score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "food_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "v_entry_avg_scores"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "ratings_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "v_trip_rankings"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      tournament_votes: {
        Row: {
          entry_a_id: string
          entry_b_id: string
          id: string
          match_order: number
          round_number: number
          tournament_id: string
          user_id: string
          voted_at: string | null
          winner_id: string
        }
        Insert: {
          entry_a_id: string
          entry_b_id: string
          id?: string
          match_order: number
          round_number: number
          tournament_id: string
          user_id: string
          voted_at?: string | null
          winner_id: string
        }
        Update: {
          entry_a_id?: string
          entry_b_id?: string
          id?: string
          match_order?: number
          round_number?: number
          tournament_id?: string
          user_id?: string
          voted_at?: string | null
          winner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_votes_entry_a_id_fkey"
            columns: ["entry_a_id"]
            isOneToOne: false
            referencedRelation: "food_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_votes_entry_a_id_fkey"
            columns: ["entry_a_id"]
            isOneToOne: false
            referencedRelation: "v_entry_avg_scores"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "tournament_votes_entry_a_id_fkey"
            columns: ["entry_a_id"]
            isOneToOne: false
            referencedRelation: "v_trip_rankings"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "tournament_votes_entry_b_id_fkey"
            columns: ["entry_b_id"]
            isOneToOne: false
            referencedRelation: "food_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_votes_entry_b_id_fkey"
            columns: ["entry_b_id"]
            isOneToOne: false
            referencedRelation: "v_entry_avg_scores"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "tournament_votes_entry_b_id_fkey"
            columns: ["entry_b_id"]
            isOneToOne: false
            referencedRelation: "v_trip_rankings"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "tournament_votes_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_votes_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "food_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_votes_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "v_entry_avg_scores"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "tournament_votes_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "v_trip_rankings"
            referencedColumns: ["entry_id"]
          },
        ]
      }
      tournaments: {
        Row: {
          bracket_size: number
          completed_at: string | null
          created_at: string | null
          created_by: string
          id: string
          seed_order: Json
          status: string | null
          total_entries: number
          total_rounds: number
          trip_id: string
        }
        Insert: {
          bracket_size: number
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          seed_order: Json
          status?: string | null
          total_entries: number
          total_rounds: number
          trip_id: string
        }
        Update: {
          bracket_size?: number
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          seed_order?: Json
          status?: string | null
          total_entries?: number
          total_rounds?: number
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournaments_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string
          trip_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string
          trip_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          invite_code: string | null
          is_public: boolean | null
          name: string
          owner_id: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          invite_code?: string | null
          is_public?: boolean | null
          name: string
          owner_id: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          invite_code?: string | null
          is_public?: boolean | null
          name?: string
          owner_id?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_entry_avg_scores: {
        Row: {
          avg_score: number | null
          entry_id: string | null
          max_score: number | null
          min_score: number | null
          rating_count: number | null
          restaurant_name: string | null
          title: string | null
          trip_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_entries_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      v_tournament_results: {
        Row: {
          entry_id: string | null
          total_wins: number | null
          tournament_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_votes_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_votes_winner_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "food_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_votes_winner_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "v_entry_avg_scores"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "tournament_votes_winner_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "v_trip_rankings"
            referencedColumns: ["entry_id"]
          },
        ]
      }
      v_trip_rankings: {
        Row: {
          avg_score: number | null
          entry_id: string | null
          max_score: number | null
          min_score: number | null
          rank: number | null
          rating_count: number | null
          restaurant_name: string | null
          title: string | null
          trip_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_entries_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_trip: {
        Args: {
          p_description?: string
          p_end_date?: string
          p_is_public?: boolean
          p_name: string
          p_start_date?: string
        }
        Returns: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          invite_code: string | null
          is_public: boolean | null
          name: string
          owner_id: string
          start_date: string | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "trips"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_trip_editor: { Args: { trip_uuid: string }; Returns: boolean }
      is_trip_member: { Args: { trip_uuid: string }; Returns: boolean }
      is_trip_owner: { Args: { trip_uuid: string }; Returns: boolean }
      join_trip_by_invite: {
        Args: { p_invite_code: string }
        Returns: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          invite_code: string | null
          is_public: boolean | null
          name: string
          owner_id: string
          start_date: string | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "trips"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
