"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { Container, Typography, CircularProgress, Paper } from "@mui/material";
import ReactMarkdown from "react-markdown";

export default function TripDetailsPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const tripRef = doc(db, "users", user.uid, "trips", id);

      try {
        const snapshot = await getDoc(tripRef);
        if (snapshot.exists()) {
          setTrip(snapshot.data());
        } else {
          console.error("Trip not found");
        }
      } catch (err) {
        console.error("Error fetching trip:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ mt: 6 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container sx={{ mt: 6 }}>
        <Typography color="error">Trip not found.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {trip.destination}
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        {trip.startDate} → {trip.endDate}
      </Typography>

      <Typography variant="subtitle2" gutterBottom>
        Activities:{" "}
        {Array.isArray(trip.activities) ? trip.activities.join(", ") : "None"}
      </Typography>

      <Paper sx={{ p: 3, mb: 3, mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Packing List
        </Typography>
        <Typography>
          <ReactMarkdown>{trip.packingList}</ReactMarkdown>
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Local Essentials
        </Typography>
        <Typography>
          <ReactMarkdown>{trip.localEssentials}</ReactMarkdown>
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Travel Tips
        </Typography>
        <Typography>
          <ReactMarkdown>{trip.travelTips}</ReactMarkdown>
        </Typography>
      </Paper>
    </Container>
  );
}
