const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Replace this with the UID of the user you want to set as admin (from firebase console)
// then run backend with node setAdmin.js
const uid = "YOUR_FIREBASE_USER_UID";

admin
  .auth()
  .setCustomUserClaims(uid, { role: "admin" })
  .then(() => {
    console.log(`Admin role set for user: ${uid}`);
  })
  .catch((error) => {
    console.error("Error setting custom claims:", error);
  });
