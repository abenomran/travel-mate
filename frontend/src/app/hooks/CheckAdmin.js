"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";

export function useAdminCheck(redirect = true) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        if (redirect) router.push("/login");
        return;
      }

      const idTokenResult = await user.getIdTokenResult(true);
      const isAdminUser = idTokenResult.claims.role === "admin";
      setIsAdmin(isAdminUser);
      setLoading(false);

      if (!isAdminUser && redirect) {
        router.push("/unauthorized");
      }
    });

    return () => unsubscribe();
  }, [redirect, router]);

  return { loading, isAdmin };
}
