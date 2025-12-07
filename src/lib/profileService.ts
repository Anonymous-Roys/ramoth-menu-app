import { supabase } from './supabase'
import type { User } from '../App'

export interface ProfileUpdateData {
  department?: string
  phone?: string
  email?: string
  profile_picture?: string
}

export const profileService = {
  async updateProfile(userId: string, data: ProfileUpdateData): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if we have a valid connection
      if (!supabase) {
        throw new Error('Database connection not available')
      }

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('generated_id', userId)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      return { success: true }
    } catch (error: any) {
      console.error('Profile update error:', error)
      
      if (error.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Network connection failed. Please check your internet connection.' 
        }
      }
      
      return { 
        success: false, 
        error: error.message || 'Failed to update profile' 
      }
    }
  },

  async getProfile(userId: string): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('generated_id', userId)
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Profile fetch error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch profile' 
      }
    }
  }
}