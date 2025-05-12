const admin = require("firebase-admin");
// old, manually downloaded service account key
// const serviceAccount = require("./serviceAccountKey.json");

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString("utf8")
);

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
