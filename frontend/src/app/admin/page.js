"use client";
import { useAdminCheck } from "@/app/hooks/CheckAdmin";
import Link from "next/link";
import Button from "@mui/material/Button";

export default function AdminPanel() {
  // admin check
  const { loading, isAdmin } = useAdminCheck(false);
  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Unauthorized</div>;

  return isAdmin ? (
    <div>
      <h2>Welcome to your Admin Panel</h2>
      <Link href="/admin/users" passHref>
        <Button
          sx={{
            backgroundColor: "#3B82F6",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#2563EB",
            },
          }}
        >
          Users
        </Button>
      </Link>
    </div>
  ) : null;
}
