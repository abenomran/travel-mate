"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection } from "firebase/firestore";
import { db } from "@/app/firebase";
import { Container, Typography, CircularProgress, Paper } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useAdminCheck } from "@/app/hooks/CheckAdmin";

export default function TripDetailsPage() {
  const { uid, tripID } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  // admin check values
  const { isAdmin } = useAdminCheck();

  useEffect(() => {
    if (!isAdmin) return; // admin check (skip fetch)

    const fetchTrip = async () => {
      const userRef = doc(collection(db, "users"), uid);
      const tripRef = doc(db, "users", uid, "trips", tripID);

      try {
        const userSnapshot = await getDoc(userRef);
        const data = userSnapshot.data();
        setUserEmail(data.email || "Email not found");

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
  }, [tripID, isAdmin]);

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

  // admin check return
  if (!isAdmin) return null;

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
