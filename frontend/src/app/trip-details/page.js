"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "@/firebaseClient";

export default function TripDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = searchParams.get("destination");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const [activities, setActivities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);

  const db = getFirestore(app);
  const activitiesCollection = collection(db, "activities");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const querySnapshot = await getDocs(activitiesCollection);
        const fetched = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setActivities(fetched);
      } catch (err) {
        console.error("Error fetching activities:", err);
      }
    };

    fetchActivities();
  }, []);

  const handleActivityChange = (event, newActivities) => {
    setSelectedActivities(newActivities);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const query = new URLSearchParams({
      destination,
      start,
      end,
      activities: selectedActivities.join(","),
    }).toString();

    router.push(`/packing-list?${query}`);
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
          Dates: <strong>{start || "N/A"}</strong> to{" "}
          <strong>{end || "N/A"}</strong>
        </Typography>

        <form onSubmit={handleSubmit}>
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Select Activities:
          </Typography>

          <ToggleButtonGroup
            value={selectedActivities}
            onChange={handleActivityChange}
            aria-label="activities"
            fullWidth
            sx={{ flexWrap: "wrap", mb: 3 }}
          >
            {activities.map((activity) => (
              <ToggleButton
                key={activity.id}
                value={activity.name}
                aria-label={activity.name}
                sx={{ m: 0.5 }}
              >
                {activity.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={selectedActivities.length === 0}
          >
            Save Trip
          </Button>
        </form>
      </Container>
    </Box>
  );
}