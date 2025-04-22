"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}
const buildGoogleCalendarUrl = ({ destination, startDate, endDate }) => {
  const formatDate = (d) => new Date(d).toISOString().replace(/[-:]|(\.\d{3})/g, '').slice(0, 15);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=Trip+to+${encodeURIComponent(destination)}` +
    `&dates=${formatDate(startDate)}/${formatDate(endDate)}` +
    `&details=${encodeURIComponent("Planned using BrainBridge!")}` +
    `&location=${encodeURIComponent(destination)}`;
};


const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return isNaN(date.getTime())
    ? "Invalid Date"
    : date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

const getWeatherIconUrl = (code) => {
  const icons = {
    1000: "https://cdn-icons-png.flaticon.com/512/869/869869.png",
    1100: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
    1101: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
    1102: "https://cdn-icons-png.flaticon.com/512/1163/1163624.png",
    2100: "https://cdn-icons-png.flaticon.com/512/1163/1163624.png",
    4000: "https://cdn-icons-png.flaticon.com/512/1163/1163620.png",
    4200: "https://cdn-icons-png.flaticon.com/512/1163/1163612.png",
    5000: "https://cdn-icons-png.flaticon.com/512/642/642102.png",
    6000: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
  };
  return icons[code] || "https://cdn-icons-png.flaticon.com/512/869/869869.png";
};

export default function GetStarted() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [forecast, setForecast] = useState([]);
  const [climateData, setClimateData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState("C");

  const debouncedDestination = useDebounce(destination, 400);
  const isValidDestination = destination.split(",").length >= 3;

  const isTripSoon = () => {
    if (!startDate) return false;
    const trip = new Date(startDate);
    const today = new Date();
    const inTenDays = new Date();
    inTenDays.setDate(today.getDate() + 10);
    return trip <= inTenDays;
  };

  useEffect(() => {
    const fetchCitySuggestions = async () => {
      if (!debouncedDestination || debouncedDestination.length < 2) return;
      try {
        const response = await fetch(`/api/cities?q=${debouncedDestination}`);
        const data = await response.json();
        const suggestions = data.data.map(
          (city) => `${city.city}, ${city.regionCode}, ${city.countryCode}`
        );
        suggestions.sort();
        setCityOptions(suggestions);
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    };
    fetchCitySuggestions();
  }, [debouncedDestination]);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      const location = encodeURIComponent(destination.trim());
      const startDateISO = new Date(startDate).toISOString();
  
      const response = await fetch(
        `https://api.tomorrow.io/v4/weather/forecast?location=${location}&apikey=${apiKey}&startTime=${startDateISO}`
      );
  
      if (!response.ok) throw new Error("City not found or API rate limit reached.");
      const data = await response.json();
  
      const filteredForecast = data.timelines.daily.filter(
        (day) => new Date(day.time) >= new Date(startDate)
      );
  
      setForecast(filteredForecast.slice(0, 9)); 
      setError("");
    } catch (err) {
      setError(err.message || "Unable to fetch weather data.");
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClimateAverages = async () => {
    try {
      const tryGeocode = async (cityName) => {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}`);
        const data = await res.json();
        return data.results?.[0];
      };

      const tryFetchClimate = async (lat, lon) => {
        const climateRes = await fetch(
          `https://climate-api.open-meteo.com/v1/climate?latitude=${lat}&longitude=${lon}&start_year=1991&end_year=2020&temperature_unit=celsius`
        );
        return await climateRes.json();
      };

      const fallbackCity = "New York";
      const cityOnly = destination.split(",")[0]?.trim();

      let geoResult = await tryGeocode(cityOnly);
      let climate = null;
      let usedFallback = false;

      if (geoResult) {
        climate = await tryFetchClimate(geoResult.latitude, geoResult.longitude);
        if (!climate.monthly || !climate.monthly[new Date(startDate).getMonth()]) {
          usedFallback = true;
        }
      } else {
        usedFallback = true;
      }

      if (usedFallback) {
        geoResult = await tryGeocode(fallbackCity);
        climate = await tryFetchClimate(geoResult.latitude, geoResult.longitude);
      }

      const thisMonthIndex = new Date(startDate).getMonth();
      const month = climate.monthly[thisMonthIndex];

      const chartData = [
        {
          name: new Date(startDate).toLocaleString("default", { month: "long" }),
          High: month.temperature_2m_max,
          Low: month.temperature_2m_min,
          Precipitation: month.precipitation_sum,
          city: usedFallback ? fallbackCity : destination,
        },
      ];

      setClimateData(chartData);
      setError("");
    } catch (err) {
      console.error("Climate fetch error:", err);
      setClimateData([]);
      setError("Check in a few weeks, your travel dates are too far out");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const tripStartDate = new Date(startDate);
  
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 5);
  
    if (!destination || !startDate) {
      setError("Please enter destination and trip dates.");
      return;
    }
  
    if (tripStartDate < today) {
      setError("Start date cannot be in the past.");
      return;
    }
  
    if (tripStartDate > maxDate) {
      setError("Start date is too far in the future. Please select a date within the next 5 days to get a weather forecast.");
      return;
    }
  
    if (isTripSoon()) {
      fetchWeather();
    } else {
      setForecast([]);
      fetchClimateAverages();
    }
  };
    

  const convertTemp = (tempC) =>
    unit === "C" ? `${tempC}°C` : `${((tempC * 9) / 5 + 32).toFixed(1)}°F`;

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
          Plan Your Trip
        </Typography>

        <form onSubmit={handleSubmit}>
          <Autocomplete
            freeSolo
            options={cityOptions}
            inputValue={destination}
            onInputChange={(e, value) => setDestination(value || "")}
            onChange={(e, value) => {
              if (value) setDestination(value);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Destination" variant="outlined" required sx={{ mb: 1 }} />
            )}
          />
        

        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            e.g. “Atlanta, GA, US” or “Paris, Île-de-France, FR”
          </Typography>

          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />

          <Button type="submit" variant="contained" fullWidth disabled={loading || !startDate || !isValidDestination}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Get Weather"}
          </Button>
        </form>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {isTripSoon() && forecast.length > 0 && (
          <>
            <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" fontWeight="bold">
                5-Day Forecast for {destination}
              </Typography>
              <Button variant="outlined" onClick={() => setUnit(unit === "C" ? "F" : "C")}>
                {unit === "C" ? "Fahrenheit" : "Celsius"}
              </Button>
            </Box>

            <Box sx={{ overflowX: "auto", whiteSpace: "nowrap", mt: 2 }}>
  <Box sx={{ display: "flex", gap: 2 }}>
    {forecast.map((day, idx) => (
      <Card
        key={idx}
        sx={{
          minWidth: 180,
          maxWidth: 180,
          flexShrink: 0,
          py: 2,
          boxShadow: 2,
          borderRadius: 3,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
            {formatDate(day.time)}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <img
              src={getWeatherIconUrl(day.values.weatherCodeMax)}
              alt="weather icon"
              style={{ width: 60, height: 60, objectFit: "contain" }}
            />
          </Box>

          <Typography fontWeight="bold" sx={{ mb: 1 }}>
            H: {convertTemp(day.values.temperatureMax)} / L: {convertTemp(day.values.temperatureMin)}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            💧 {day.values.precipitationProbabilityAvg ?? 0}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            🌬 {day.values.windSpeedAvg} m/s
          </Typography>
        </CardContent>
      </Card>
    ))}
  </Box>
</Box>
          </>
        )}

        {!isTripSoon() && climateData.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Climate Trends for {climateData[0].city} in{" "}
              {new Date(startDate).toLocaleString("default", { month: "long" })}
            </Typography>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={climateData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="High" fill="#f57c00" />
                <Bar dataKey="Low" fill="#42a5f5" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

{(destination && startDate) && (
          <>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 4 }}
              onClick={() =>
                router.push(
                  `/trip-details?destination=${encodeURIComponent(destination)}&start=${startDate}&end=${endDate}`
                )
              }
            >
              Next: Choose Activities
            </Button>

            {endDate && (
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() =>
                  window.open(buildGoogleCalendarUrl({ destination, startDate, endDate }), "_blank")
                }
              >
                Save to Google Calendar
              </Button>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
  

