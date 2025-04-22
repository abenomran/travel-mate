"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  CircularProgress,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "@/firebaseClient";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function GetStarted() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidDestination = destination.split(",").length >= 3;
  const debouncedDestination = useDebounce(destination, 300); // 300ms delay


  // Fetch city autocomplete options
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedDestination.length < 2) return;
      try {
        const response = await fetch(`/api/cities?q=${debouncedDestination}`);
        const data = await response.json();
        const options = data.data.map(
          (city) => `${city.city}, ${city.regionCode}, ${city.countryCode}`
        );
        setCityOptions(options.sort());
      } catch (err) {
        console.error("City autocomplete failed:", err);
      }
    };
    fetchSuggestions();
  }, [debouncedDestination]);

  // Fetch activities from Firebase
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const db = getFirestore(app);
        const querySnapshot = await getDocs(collection(db, "activities"));
        const activityList = querySnapshot.docs.map((doc) => doc.data().name);
        setActivities(activityList);
      } catch (err) {
        console.error("Error fetching activities:", err);
      }
    };
    fetchActivities();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destination || !startDate || selectedActivities.length === 0) {
      setError("Please complete all fields.");
      return;
    }

    const query = new URLSearchParams({
      destination,
      start: startDate,
      end: endDate,
      activities: selectedActivities.join(","),
    }).toString();

    router.push(`/packing-list?${query}`);
  };

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          Plan Your Trip
        </Typography>

        <form onSubmit={handleSubmit}>
          <Autocomplete
            freeSolo
            options={cityOptions}
            inputValue={destination}
            onInputChange={(e, value) => setDestination(value || "")}
            onChange={(e, value) => value && setDestination(value)}
            renderInput={(params) => (
              <TextField {...params} label="Destination" required sx={{ mb: 2 }} />
            )}
          />

          <TextField
            type="date"
            fullWidth
            required
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            type="date"
            fullWidth
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Select Activities:
          </Typography>
          <ToggleButtonGroup
            value={selectedActivities}
            onChange={(e, val) => setSelectedActivities(val)}
            fullWidth
            aria-label="activity selection"
            sx={{ flexWrap: "wrap", mb: 3 }}
          >
            {activities.map((activity) => (
              <ToggleButton key={activity} value={activity} sx={{ m: 0.5 }}>
                {activity}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !isValidDestination}
          >
            {loading ? <CircularProgress size={24} /> : "Next: Get Packing List"}
          </Button>
        </form>
      </Container>
    </Box>
  );
}
