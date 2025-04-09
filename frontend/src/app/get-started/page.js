"use client";
import React, { useState } from "react";
import { Box, Button, Container, Typography, TextField, CircularProgress } from "@mui/material";

export default function GetStarted() {
  const [destination, setDestination] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const fetchWeather = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY; // Your Weather API key
      
      const city = encodeURIComponent(destination.trim());
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${destination}&appid=${apiKey}&units=metric`
      );
      if (!response.ok) {
        throw new Error("City not found. Please enter a valid location.");
      }
      const data = await response.json();
      setWeather(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to fetch weather data. Please try again.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (destination.trim()) {

      fetchWeather();
    } 
  };

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Enter Your Destination
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Destination"
            variant="outlined"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={!destination.trim() || loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Get Weather Forecast"}
          </Button>
        </form>
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        {weather && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight="bold">
              Weather in {weather.name}
            </Typography>
            <Typography>Temperature: {weather.main.temp}°C</Typography>
            <Typography>Condition: {weather.weather[0].description}</Typography>
            <Typography>Humidity: {weather.main.humidity}%</Typography>
            <Typography>Wind Speed: {weather.wind.speed} m/s</Typography>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
          </Box>
        )}
        {(weather || error) && (
          <Button
            onClick = {() => {
              setDestination("");
              setWeather(null);
              setError("");
            }}
            variant = "outlined"
            sx = {{ mt: 2 }}
          >
            Reset
          </Button>
        )}

      </Container>
    </Box>
  );
}