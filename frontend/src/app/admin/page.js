"use client";
import { useAdminCheck } from "@/app/hooks/CheckAdmin";
import { Button, Container, Typography, Stack, Box, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { getFirestore, collection, collectionGroup, getCountFromServer } from "firebase/firestore";

export default function AdminPanel() {
  const { loading, isAdmin } = useAdminCheck(false);
  const [stats, setStats] = useState({ users: 0, trips: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    if (!isAdmin) return;

    const fetchStats = async () => {
      try {
        const usersCol = collection(db, "users");
        const usersSnapshot = await getCountFromServer(usersCol);

        const tripsColGroup = collectionGroup(db, "trips");
        const tripsSnapshot = await getCountFromServer(tripsColGroup);

        setStats({
          users: usersSnapshot.data().count,
          trips: tripsSnapshot.data().count
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin, db]);

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Unauthorized</div>;

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        TravelMate Admin Dashboard
      </Typography>

      <Typography variant="body1" sx={{ mb: 4 }}>
        Here you can manage site content, user accounts, and more.
      </Typography>

      <Box sx={{ mb: 4 }}>
        {statsLoading ? (
          <CircularProgress />
        ) : (
          <Stack direction="row" spacing={4}>
            <Box>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h5" color="primary">
                {stats.users}
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6">Total Trips</Typography>
              <Typography variant="h5" color="primary">
                {stats.trips}
              </Typography>
            </Box>
          </Stack>
        )}
      </Box>

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
  );
}
