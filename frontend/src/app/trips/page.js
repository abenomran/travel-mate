"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, doc, getDocs } from "firebase/firestore";
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

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("User not logged in");
        return;
      }

      const uid = user.uid;
      const tripsRef = collection(doc(collection(db, "users"), uid), "trips");

      try {
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
  }, []);

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Your Trips
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : trips.length === 0 ? (
        <>
          <Typography variant="h6" gutterBottom>
            Looks like you haven't created any trips yet.
          </Typography>
          <Typography variant="body1" gutterBottom>
            Ready to start planning? Let us help you pack smart and travel
            better.
          </Typography>
          <Button variant="contained" color="primary" href="/get-started">
            Plan Your First Trip
          </Button>
        </>
      ) : (
        <Grid container spacing={3}>
          <Box sx={{ width: "100%" }}>
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trip/${trip.id}`}
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
