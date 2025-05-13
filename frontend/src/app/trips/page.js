"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  ButtonBase,
  Box,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import Link from "next/link";
import dayjs from "dayjs";

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminderMessage, setReminderMessage] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("User not logged in");
        setLoading(false);
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

    const fetchReminderTemplate = async () => {
      try {
        const reminderDoc = await getDoc(
          doc(db, "templates", "reminderTemplate")
        );
        if (reminderDoc.exists()) {
          setReminderMessage(reminderDoc.data().text || "");
        }
      } catch (err) {
        console.log("Error fetching reminder template:", err);
      }
    };

    fetchTrips();
    fetchReminderTemplate();
  }, []);

  const today = dayjs();

  // upcoming/current
  const upcomingTrips = trips.filter((trip) => {
    if (!trip.startDate || !trip.endDate) return false;
    const start = dayjs(trip.startDate);
    const end = dayjs(trip.endDate);
    return (
      (start.diff(today, "day") >= 0 && start.diff(today, "day") < 3) || // starts soon
      (start.isBefore(today, "day") && end.isAfter(today, "day")) // currently ongoing
    );
  });

  // Future trips — not upcoming/current
  const futureTrips = trips.filter((trip) => {
    if (!trip.startDate || !trip.endDate) return false;
    const start = dayjs(trip.startDate);
    return start.diff(today, "day") >= 3;
  });

  // Past trips - fully ended
  const pastTrips = trips.filter((trip) => {
    if (!trip.endDate) return false;
    const end = dayjs(trip.endDate);
    return end.isBefore(today, "day");
  });

  const renderTrips = (tripList) => (
    <Grid container spacing={3}>
      <Box sx={{ width: "100%" }}>
        {tripList.map((trip) => (
          <Link key={trip.id} href={`/trip/${trip.id}`} passHref legacyBehavior>
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
                  {dayjs(trip.startDate).format("MMM D, YYYY")}{" "}
                  <Typography
                    component="span"
                    variant="body2"
                    color="primary"
                    sx={{ mx: 0.5 }}
                  >
                    →
                  </Typography>
                  {dayjs(trip.endDate).format("MMM D, YYYY")}
                </Typography>
                {trip.activities?.length > 0 ? (
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    spacing={1}
                    sx={{ mt: 1 }}
                  >
                    {trip.activities.map((act) => (
                      <Chip key={act} label={act} size="small" />
                    ))}
                  </Stack>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, fontStyle: "italic" }}
                  >
                    No activities planned
                  </Typography>
                )}
              </ButtonBase>
            </Box>
          </Link>
        ))}
      </Box>
    </Grid>
  );

  return (
    <Box
      sx={{
        background:
          "linear-gradient(135deg,rgb(216, 243, 250) 0%,rgb(178, 227, 255) 100%)",
        minHeight: "100vh",
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Your Trips
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : trips.length === 0 ? (
          <>
            <Typography variant="h6" gutterBottom>
              {"Looks like you haven't created any trips yet."}
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
          <>
            <Typography variant="h5" sx={{ mt: 4, mb: 1 }} fontWeight="bold">
              Upcoming Trips
            </Typography>
            {reminderMessage && upcomingTrips.length > 0 && (
              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  color: "#b34104",
                  fontWeight: 500,
                  backgroundColor: "#fff7eb",
                  p: 1.5,
                  borderRadius: 1,
                  borderLeft: "4px solid orange",
                  whiteSpace: "pre-line", // ← preserves \n as line breaks
                }}
              >
                {reminderMessage}
              </Typography>
            )}
            {upcomingTrips.length > 0 ? (
              renderTrips(upcomingTrips)
            ) : (
              <Typography variant="body2" sx={{ mb: 2 }}>
                No upcoming trips in the next 3 days.
              </Typography>
            )}

            <Typography variant="h5" sx={{ mt: 4, mb: 1 }} fontWeight="bold">
              Future Trips
            </Typography>
            {futureTrips.length > 0 ? (
              renderTrips(futureTrips)
            ) : (
              <Typography variant="body2">No future trips yet.</Typography>
            )}

            <Typography variant="h5" sx={{ mt: 4, mb: 1 }} fontWeight="bold">
              Past Trips
            </Typography>
            {pastTrips.length > 0 ? (
              renderTrips(pastTrips)
            ) : (
              <Typography variant="body2">No past trips yet.</Typography>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
