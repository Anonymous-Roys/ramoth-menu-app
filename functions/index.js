const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// 🔔 8:00 PM DAILY REMINDER (Ghana Time)
exports.send8pmReminder = functions.pubsub
  .schedule("0 20 * * *") // 8:00 PM
  .timeZone("Africa/Accra")
  .onRun(async () => {
    const message = {
      notification: {
        title: "🍽️ Meal Reminder",
        body: "Don’t forget to select your meal for tomorrow before 8:00 PM!",
      },
      topic: "workers",
    };

    try {
      await admin.messaging().send(message);
      console.log("✅ 8PM reminder sent successfully");
    } catch (error) {
      console.error("❌ Error sending reminder:", error);
    }

    return null;
  });
