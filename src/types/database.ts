export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      weight_tracker_settings: {
        Row: {
          id: string
          user_id: string
          daily_walking_minutes_goal: number
          weekly_goal_days: number
          show_daily_tip: boolean
          show_daily_challenge: boolean
          tip_categories: Json
          reminder_tip_time: string | null
          reminder_walking_time: string | null
          reminder_weight_frequency: string | null
          reminder_weight_time: string | null
          weight_unit: string
          week_starts_on: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          daily_walking_minutes_goal?: number
          weekly_goal_days?: number
          show_daily_tip?: boolean
          show_daily_challenge?: boolean
          tip_categories?: Json
          reminder_tip_time?: string | null
          reminder_walking_time?: string | null
          reminder_weight_frequency?: string | null
          reminder_weight_time?: string | null
          weight_unit?: string
          week_starts_on?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          daily_walking_minutes_goal?: number
          weekly_goal_days?: number
          show_daily_tip?: boolean
          show_daily_challenge?: boolean
          tip_categories?: Json
          reminder_tip_time?: string | null
          reminder_walking_time?: string | null
          reminder_weight_frequency?: string | null
          reminder_weight_time?: string | null
          weight_unit?: string
          week_starts_on?: string
          created_at?: string
          updated_at?: string
        }
      }
      steps_records: {
        Row: {
          id: string
          user_id: string
          date: string
          minutes: number
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          minutes: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          minutes?: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      weight_records: {
        Row: {
          id: string
          user_id: string
          recorded_at: string
          weight: number
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recorded_at?: string
          weight: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recorded_at?: string
          weight?: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tips: {
        Row: {
          id: string
          category: string
          title: string
          body: string
          extended_body: string | null
          tags: Json | null
          difficulty: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          title: string
          body: string
          extended_body?: string | null
          tags?: Json | null
          difficulty?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          title?: string
          body?: string
          extended_body?: string | null
          tags?: Json | null
          difficulty?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          category: string
          title: string
          description: string
          metric_type: string
          metric_value: number | null
          rules: string | null
          difficulty: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          title: string
          description: string
          metric_type: string
          metric_value?: number | null
          rules?: string | null
          difficulty: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          title?: string
          description?: string
          metric_type?: string
          metric_value?: number | null
          rules?: string | null
          difficulty?: string
          is_active?: boolean
          created_at?: string
        }
      }
      daily_tip_history: {
        Row: {
          id: string
          user_id: string
          tip_id: string
          shown_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tip_id: string
          shown_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tip_id?: string
          shown_date?: string
          created_at?: string
        }
      }
      daily_challenge_history: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          shown_date: string
          completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          shown_date: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          shown_date?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
      user_gamification: {
        Row: {
          id: string
          user_id: string
          total_xp: number
          level: number
          current_streak: number
          longest_streak: number
          total_walking_minutes_logged: number
          total_weight_logged: number
          total_challenges_completed: number
          last_activity_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          total_walking_minutes_logged?: number
          total_weight_logged?: number
          total_challenges_completed?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          total_walking_minutes_logged?: number
          total_weight_logged?: number
          total_challenges_completed?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          key: string
          title: string
          description: string
          icon: string
          category: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
          rarity: string
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          title: string
          description: string
          icon: string
          category: string
          requirement_type: string
          requirement_value: number
          xp_reward?: number
          rarity?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          title?: string
          description?: string
          icon?: string
          category?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
          rarity?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
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
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
