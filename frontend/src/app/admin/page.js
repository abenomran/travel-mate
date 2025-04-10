"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      router.push("/login");
      return;
    }

    user.getIdTokenResult(true).then((idTokenResult) => {
      if (idTokenResult.claims.role === "admin") {
        setIsAdmin(true);
      } else {
        router.push("/unauthorized");
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return isAdmin ? <div>Welcome to your Admin Panel</div> : null;
}
