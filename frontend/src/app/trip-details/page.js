"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Snackbar,
} from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import app from "@/firebaseClient";

export default function TripDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = searchParams.get("destination");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const [activities, setActivities] = useState([]);
  const [reminderDate, setReminderDate] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const db = getFirestore(app);

  const handleActivityChange = (event, newActivities) => {
    setActivities(newActivities);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth(app);
    const user = auth.currentUser;
    const uid = user?.uid;

    const tripData = {
      destination,
      start,
      end,
      activities,
      reminderDate,
      uid,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "trips"), tripData);
      if (reminderDate) {
        await addDoc(collection(db, "reminders"), {
          destination,
          start,
          reminderDate,
          createdAt: serverTimestamp(),
        });
      }
      router.push(`/packing-list?destination=${destination}&start=${start}&end=${end}&activities=${activities.join(",")}&reminderDate=${reminderDate}`);
    } catch (err) {
      console.error("Error saving trip:", err);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/packing-list?destination=${destination}&start=${start}&end=${end}&activities=${activities.join(",")}`;
    navigator.clipboard.writeText(url);
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Trip Details
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          Destination: <strong>{destination || "N/A"}</strong>
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Dates: <strong>{start || "N/A"}</strong> to <strong>{end || "N/A"}</strong>
        </Typography>

        <form onSubmit={handleSubmit}>
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Select Activities:
          </Typography>

          <ToggleButtonGroup
            value={activities}
            onChange={handleActivityChange}
            aria-label="activities"
            fullWidth
            sx={{ flexWrap: "wrap", mb: 3 }}
          >
            {["Hiking", "Beach", "Business", "Backpacking", "Skiing", "Photography", "Sightseeing"].map((activity) => (
              <ToggleButton
                key={activity}
                value={activity}
                aria-label={activity}
                sx={{ m: 0.5 }}
              >
                {activity}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <TextField
            label="Reminder Date (YYYY-MM-DD)"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={activities.length === 0}
            sx={{ mb: 2 }}
          >
            Save Trip
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={handleCopyLink}
          >
            Copy Shareable Trip Link
          </Button>
        </form>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Trip link copied to clipboard!"
      />
    </Box>
  );
}