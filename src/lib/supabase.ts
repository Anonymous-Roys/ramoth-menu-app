import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          generated_id: string
          first_name: string
          last_name: string
          name: string
          email: string | null
          date_of_birth: string | null
          department: string
          role: 'worker' | 'admin'
          unique_number: number
          created_at: string
        }
        Insert: {
          id?: string
          generated_id: string
          first_name: string
          last_name: string
          name: string
          email?: string | null
          date_of_birth?: string | null
          department: string
          role: 'worker' | 'admin'
          unique_number: number
          created_at?: string
        }
        Update: {
          id?: string
          generated_id?: string
          first_name?: string
          last_name?: string
          name?: string
          email?: string | null
          date_of_birth?: string | null
          department?: string
          role?: 'worker' | 'admin'
          unique_number?: number
          created_at?: string
        }
      }
      menus: {
        Row: {
          id: string
          date: string
          meals: any[]
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          meals: any[]
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          meals?: any[]
          created_by?: string
          created_at?: string
        }
      }
      selections: {
        Row: {
          id: string
          user_id: string
          menu_id: string
          meal_id: string
          meal_name: string
          date: string
          location: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          menu_id: string
          meal_id: string
          meal_name: string
          date: string
          location?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          menu_id?: string
          meal_id?: string
          meal_name?: string
          date?: string
          location?: any
          created_at?: string
        }
      }
    }
  }
}