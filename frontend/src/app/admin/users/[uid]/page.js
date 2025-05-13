"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/app/firebase";
import { collection, doc, getDoc, getDocs, addDoc } from "firebase/firestore";
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  ButtonBase,
  Box,
  Button,
  Stack,
} from "@mui/material";
import Link from "next/link";
import { useAdminCheck } from "@/app/hooks/CheckAdmin";
import CreateTripDialog from "@/app/admin/components/CreateTripDialog";

export default function Trips() {
  const { uid } = useParams();
  const [userEmail, setUserEmail] = useState("");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const { isAdmin } = useAdminCheck();

  useEffect(() => {
    if (!isAdmin) return;

    const fetchTrips = async () => {
      const userRef = doc(collection(db, "users"), uid);
      const tripsRef = collection(userRef, "trips");

      try {
        const userSnapshot = await getDoc(userRef);
        const data = userSnapshot.data();
        setUserEmail(data.email || "Email not found");

        const snapshot = await getDocs(tripsRef);
        const tripsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrips(tripsData);
      } catch (err) {
        console.log("Error fetching trips:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [isAdmin, uid]);

  const handleCreateTrip = async (tripData) => {
    try {
      const userRef = doc(collection(db, "users"), uid);
      const tripsRef = collection(userRef, "trips");

      await addDoc(tripsRef, {
        ...tripData,
        createdAt: new Date().toISOString(),
      });

      const snapshot = await getDocs(tripsRef);
      const tripsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrips(tripsData);
    } catch (err) {
      console.error("Error creating trip:", err);
      alert("Failed to create trip: " + err.message);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 6 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isAdmin) return null;

  return (
    <Container sx={{ mt: 6 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {`${userEmail}'s Trips`}
        </Typography>

        <Button
          variant="contained"
          onClick={() => setOpenCreateDialog(true)}
          sx={{ height: "fit-content" }}
        >
          Create New Trip
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : trips.length === 0 ? (
        <>
          <Typography variant="h6" gutterBottom>
            {"User hasn't created any trips yet."}
          </Typography>
        </>
      ) : (
        <Grid container spacing={3}>
          <Box sx={{ width: "100%" }}>
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/admin/users/${uid}/${trip.id}`}
                passHref
                legacyBehavior
              >
                <Box
                  component="a"
                  sx={{
                    width: "100%",
                    display: "block",
                    textDecoration: "none",
                  }}
                >
                  <ButtonBase
                    sx={{
                      width: "100%",
                      textAlign: "left",
                      mb: 2,
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: "#fff",
                      borderLeft: "6px solid #1976d2",
                      boxShadow: 1,
                      transition: "transform 0.15s ease, box-shadow 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#f0f4ff",
                        transform: "scale(1.01)",
                        boxShadow: 3,
                      },
                      display: "block",
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {trip.destination}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {trip.startDate} → {trip.endDate}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Activities: {trip.activities?.join(", ") || "None"}
                    </Typography>
                  </ButtonBase>
                </Box>
              </Link>
            ))}
          </Box>
        </Grid>
      )}

      <CreateTripDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreate={handleCreateTrip}
        uid={uid}
      />
    </Container>
  );
}
