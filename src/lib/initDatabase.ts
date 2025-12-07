import { supabase } from './supabase'

export const initializeDatabase = async () => {
  try {
    // Set current user context for RLS
    const currentUser = localStorage.getItem('currentUser')
    if (currentUser) {
      const user = JSON.parse(currentUser)
      await supabase.rpc('set_config', {
        setting_name: 'app.current_user_id',
        setting_value: user.generated_id,
        is_local: true
      })
    }
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

// Call this when user logs in
export const setUserContext = async (userId: string) => {
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id', 
      setting_value: userId,
      is_local: true
    })
  } catch (error) {
    console.error('Error setting user context:', error)
  }
}