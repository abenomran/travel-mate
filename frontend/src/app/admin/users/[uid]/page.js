"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/app/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  ButtonBase,
  Box,
  Button,
} from "@mui/material";
import Link from "next/link";
import { useAdminCheck } from "@/app/hooks/CheckAdmin";

export default function Trips() {
  const { uid } = useParams();
  const [userEmail, setUserEmail] = useState("");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // admin check values
  const { isAdmin } = useAdminCheck();

  useEffect(() => {
    if (!isAdmin) return; // admin check (skip fetch)

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
  }, [isAdmin]);

  if (loading) {
    return (
      <Container sx={{ mt: 6 }}>
        <CircularProgress />
      </Container>
    );
  }

  // admin check return
  if (!isAdmin) return null;

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        {userEmail}'s Trips
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : trips.length === 0 ? (
        <>
          <Typography variant="h6" gutterBottom>
            User hasn't created any trips yet.
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
    </Container>
  );
}
