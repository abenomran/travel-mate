import { NextResponse } from "next/server";
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "@/serviceAccountKey.json";

// initialize firebase SDK for backend (admin)
const app =
  getApps().length === 0
    ? initializeApp({ credential: cert(serviceAccount) })
    : getApp();

const auth = getAuth(app);

// Fetches all Firebase users
export async function GET() {
  try {
    const listUsersResult = await getAuth().listUsers();
    const users = listUsersResult.users.map((userRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      role: userRecord.customClaims?.role || "user", // for admin filtering
    }));

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Creates new firebase user
export async function POST(req) {
  const { email, password } = await req.json();

  try {
    const userRecord = await getAuth().createUser({ email, password });
    return NextResponse.json({ uid: userRecord.uid });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Deletes firebase user
export async function DELETE(req) {
  const { uid } = await req.json();

  if (!uid) {
    return NextResponse.json({ error: "UID is required" }, { status: 400 });
  }

  try {
    await getAuth().deleteUser(uid);
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update user password
export async function PATCH(req) {
  // get uid and new password from request body
  const { uid, password } = await req.json();

  if (!uid || !password) {
    return NextResponse.json(
      { error: "UID and new password required" },
      { status: 400 }
    );
  }

  try {
    await getAuth().updateUser(uid, { password: password });
    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
