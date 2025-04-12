"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useSearchParams } from "next/navigation";

export default function TripDetails() {
  const searchParams = useSearchParams();
  const destination = searchParams.get("destination");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const [activities, setActivities] = useState([]);

  const handleActivityChange = (event, newActivities) => {
    setActivities(newActivities);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Destination:", destination);
    console.log("Start Date:", start);
    console.log("End Date:", end);
    console.log("Activities:", activities);

    alert("Trip saved! (or redirect to packing list)");
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
            {["Hiking", "Beach", "Business", "Backpacking", "Skiing", "Photography", "Sightseeing"].map(
              (activity) => (
                <ToggleButton
                  key={activity}
                  value={activity}
                  aria-label={activity}
                  sx={{ m: 0.5 }}
                >
                  {activity}
                </ToggleButton>
              )
            )}
          </ToggleButtonGroup>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={activities.length === 0}
          >
            Save Trip
          </Button>
        </form>
      </Container>
    </Box>
  );
}
