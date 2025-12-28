importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDD9MLsSWX7AZpRiislgXlU8dJ1h8bw-DU",
  authDomain: "ramoth-menu-app.firebaseapp.com",
  projectId: "ramoth-menu-app",
  storageBucket: "ramoth-menu-app.firebasestorage.app",
  messagingSenderId: "326261066390",
  appId: "1:326261066390:web:a0d2654888e863616c90b7",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo.png",
  });
});
