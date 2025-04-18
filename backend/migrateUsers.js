const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();

async function migrateUsersToFirestore(nextPageToken) {
  const listUsersResult = await auth.listUsers(1000, nextPageToken);

  for (const user of listUsersResult.users) {
    const uid = user.uid;
    const userData = {
      email: user.email || "",
      name: user.displayName || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("users").doc(uid).set(userData, { merge: true });
    console.log(`Migrated user: ${uid}`);
  }

  if (listUsersResult.pageToken) {
    await migrateUsersToFirestore(listUsersResult.pageToken);
  }
}

migrateUsersToFirestore()
  .then(() => console.log("All users migrated to Firestore."))
  .catch(console.error);
