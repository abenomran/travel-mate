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
  Paper,
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
  const debouncedDestination = useDebounce(destination, 300);

  // City autocomplete
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedDestination.length < 2) return;
      try {
        const res = await fetch(`/api/cities?q=${debouncedDestination}`);
        const { data } = await res.json();
        const opts = data.map(
          (city) => `${city.city}, ${city.regionCode}, ${city.countryCode}`
        );
        setCityOptions(opts.sort());
      } catch (e) {
        console.error(e);
      }
    };
    fetchSuggestions();
  }, [debouncedDestination]);

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, "activities"));
      const list = snap.docs.map((d) => d.data().name).sort();
      setActivities(list);
    };
    fetchActivities();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!destination) {
      setError("Please enter a destination.");
      return;
    }
  
    if (!startDate) {
      setError("Please enter a valid start date.");
      return;
    }
  
    if (!endDate) {
      setError("Please enter a valid end date.");
      return;
    }
  
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    if (start > end) {
      setError("Start date cannot be after end date.");
      return;
    }
  
    if (selectedActivities.length === 0) {
      setError("Please select at least one activity.");
      return;
    }
  
    setError("");
  
    setLoading(true);
  
    const params = new URLSearchParams({
      destination,
      start: startDate,
      end: endDate,
      activities: selectedActivities.join(","),
    });
  
    router.push(`/packing-list?${params}`);
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg,rgb(216, 243, 250) 0%,rgb(178, 227, 255) 100%)',
        minHeight: '100vh',
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', color: '#333' }}
          >
            Plan Your Trip
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            <Autocomplete
              freeSolo
              options={cityOptions}
              inputValue={destination}
              onInputChange={(_, val) => setDestination(val || "")}
              onChange={(_, val) => val && setDestination(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Destination"
                  variant="outlined"
                  required
                  fullWidth
                  sx={{ mb: 3 }}
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                inputProps={{
                  min: startDate || new Date().toISOString().split('T')[0]
                }}
              />
            </Box>

            <Typography variant="subtitle1" sx={{ mb: 1, color: '#555' }}>
              Select Activities
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {activities.map((act) => (
                <ToggleButton
                  key={act}
                  value={act}
                  selected={selectedActivities.includes(act)}
                  onChange={() => {
                    setSelectedActivities((prev) =>
                      prev.includes(act)
                        ? prev.filter((a) => a !== act)
                        : [...prev, act]
                    );
                  }}
                  size="small"
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    },
                  }}
                >
                  {act}
                </ToggleButton>
              ))}
            </Box>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || !isValidDestination}
              sx={{ borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Next ✓'}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}