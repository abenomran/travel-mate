"use client";
import { useAdminCheck } from "@/app/hooks/CheckAdmin";
import Link from "next/link";
import { Button, Container, Typography, Stack } from "@mui/material";

export default function AdminPanel() {
  // admin check
  const { loading, isAdmin } = useAdminCheck(false);
  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Unauthorized</div>;

  return isAdmin ? (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the TravelMate Admin Dashboard
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        Here you can manage site content, user accounts, and more.
      </Typography>

      <Stack spacing={2} direction="row" flexWrap="wrap">
        <Button variant="contained" href="/admin/users">
          Manage Users
        </Button>
        <Button variant="contained" href="/admin/about">
          Edit About/FAQ
        </Button>
        <Button variant="contained" href="/admin/activities">
          Edit Activities
        </Button>
        <Button variant="contained" href="/admin/reminder">
          Edit Reminder Template
        </Button>
      </Stack>
    </Container>
  ) : null;
}
