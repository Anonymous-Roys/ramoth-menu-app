import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface NotificationSystemProps {
  hasSelectedToday: boolean
  currentTime: Date
  userId: string
}

export function NotificationSystem({ hasSelectedToday, currentTime, userId }: NotificationSystemProps) {
  const [hasShownNotification, setHasShownNotification] = useState(false)

  const checkIfStillNotSelected = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('selections')
        .select('id')
        .eq('user_id', userId)
        .eq('date', today)
        .single()
      
      return !data
    } catch {
      return true
    }
  }

  const showNotification = async () => {
    // Show system notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('🍽️ Ramoth Menu Reminder', {
        body: 'Don\'t forget to select your meal! Deadline is 9:00 AM. Click to open app.',
        icon: '/logo.png',
        tag: 'meal-reminder-' + userId,
        requireInteraction: true,
        silent: false
      })
      
      // Handle notification click
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
      
      // Schedule follow-up notification
      setTimeout(async () => {
        const stillNotSelected = await checkIfStillNotSelected()
        if (stillNotSelected) {
          const finalNotification = new Notification('⚠️ Final Reminder - Ramoth Menu', {
            body: 'Last chance! Meal selection closes in 15 minutes.',
            icon: '/logo.png',
            tag: 'final-reminder-' + userId,
            requireInteraction: true
          })
          
          finalNotification.onclick = () => {
            window.focus()
            finalNotification.close()
          }
        }
      }, 1 * 60 * 1000)
    }
  }

  useEffect(() => {
    const checkDeadlineNotification = () => {
      const hours = currentTime.getHours()
      const minutes = currentTime.getMinutes()
      
      // Show notification at 1:03 AM for testing
      const isNotificationTime = hours === 12 && minutes >= 0
      
      if (!hasSelectedToday && isNotificationTime && !hasShownNotification) {
        showNotification()
        setHasShownNotification(true)
      }
      
      // Reset notification flag at midnight
      if (hours === 0 && minutes === 0) {
        setHasShownNotification(false)
      }
    }

    checkDeadlineNotification()
  }, [currentTime, hasSelectedToday, hasShownNotification, userId])



  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          const notification = new Notification('✅ Ramoth Menu App', {
            body: 'Notifications enabled! You\'ll receive meal reminders.',
            icon: '/logo.png',
            tag: 'setup-complete'
          })
          
          notification.onclick = () => {
            window.focus()
            notification.close()
          }
        }
      })
    }
  }, [])

  return null
}