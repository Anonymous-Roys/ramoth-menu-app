import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { getFunctions, httpsCallable } from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyDD9MLsSWX7AZpRiislgXlU8dJ1h8bw-DU",
  authDomain: "ramoth-menu-app.firebaseapp.com",
  projectId: "ramoth-menu-app",
  storageBucket: "ramoth-menu-app.firebasestorage.app",
  messagingSenderId: "326261066390",
  appId: "1:326261066390:web:a0d2654888e863616c90b7"
};

const app = initializeApp(firebaseConfig)
export const messaging = getMessaging(app)

export async function enableNotifications() {
  try {
    console.log('Requesting permission...')
    const permission = await Notification.requestPermission()
    console.log('Permission:', permission)

    if (permission !== 'granted') {
      throw new Error('Permission not granted')
    }

    console.log('Getting FCM token...')
    const token = await getToken(messaging, {
      vapidKey: 'BDDtiCUm23EfJ3OwdHnAXDIM6bcMbe_vfpIOi-p93vgEAe4QH3vylQVcEeH9D7YwIf6M3EqIjo3-715z4jy2Chg'
    })

    if (!token) {
      throw new Error('No token returned')
    }

    console.log('✅ FCM TOKEN:', token)
    return token
  } catch (err) {
    console.error('❌ FCM ERROR:', err)
  }

   // 🔔 Subscribe token to workers topic
  const functions = getFunctions()
  const subscribe = httpsCallable(functions, 'subscribeToWorkers')
  await subscribe({ token })
}



