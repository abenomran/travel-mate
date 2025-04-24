"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import ReactMarkdown from "react-markdown";

const getWeatherIconUrl = (code) => {
  const icons = {
    1000: "https://cdn-icons-png.flaticon.com/512/869/869869.png", // Sunny
    1100: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
    1101: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
    1102: "https://cdn-icons-png.flaticon.com/512/1163/1163624.png",
    2100: "https://cdn-icons-png.flaticon.com/512/1163/1163624.png",
    4000: "https://cdn-icons-png.flaticon.com/512/1163/1163620.png",
    4200: "https://cdn-icons-png.flaticon.com/512/1163/1163612.png",
    5000: "https://cdn-icons-png.flaticon.com/512/414/414974.png", // Rain
    6000: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
  };
  return icons[code] || icons[1000];
};

const getIconForHistoricalDay = (precip = 0, highTemp = 20) => {
  const tempF = (highTemp * 9) / 5 + 32;

  if (tempF > 60) {
    if (precip > 1)
      return "https://cdn-icons-png.flaticon.com/512/414/414974.png"; // Rainy
    else
      return "https://cdn-icons-png.flaticon.com/512/869/869869.png"; // Sunny
  } else {
    return "https://cdn-icons-png.flaticon.com/512/642/642102.png"; // Snowy/Cold
  }
};


const getLatLon = async (cityName) => {
  const simplified = cityName.split(",")[0].trim();
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(simplified)}`
  );
  const data = await res.json();
  const result = data.results?.[0];
  if (!result) throw new Error("Could not find location for: " + cityName);
  return { lat: result.latitude, lon: result.longitude };
};

const buildGoogleCalendarUrl = ({ destination, startDate, endDate }) => {
  const formatDate = (d) =>
    new Date(d).toISOString().replace(/[-:]|(\.\d{3})/g, "").slice(0, 15);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=Trip+to+${encodeURIComponent(destination)}` +
    `&dates=${formatDate(startDate)}/${formatDate(endDate)}` +
    `&details=${encodeURIComponent("Planned !")}` +
    `&location=${encodeURIComponent(destination)}`;
};

export default function TripDetailsPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState([]);
  const [climateData, setClimateData] = useState([]);
  const [unit, setUnit] = useState("F");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [isTooFarOut, setIsTooFarOut] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const tripRef = doc(db, "users", user.uid, "trips", id);
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

  useEffect(() => {
    if (!trip) return;

    const fetchWeatherOrClimate = async () => {
      const { destination, startDate, endDate } = trip;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();
      const MS_PER_DAY = 1000 * 60 * 60 * 24;
      const fiveDaysFromNow = new Date(now.getTime() + 5 * MS_PER_DAY);
      const isWithinFiveDays = start <= fiveDaysFromNow;

      if (isWithinFiveDays) {
        try {
          const location = encodeURIComponent(destination.trim());
          const response = await fetch(
            `https://api.tomorrow.io/v4/weather/forecast?location=${location}&apikey=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&startTime=${start.toISOString()}&endTime=${end.toISOString()}`
          );
          const data = await response.json();
          setTimezone(data.location?.tz || timezone);
          const forecastSlice = data.timelines.daily.filter(
            (d) => new Date(d.time) >= start
          );
          setForecast(forecastSlice.slice(0, 5));
          setIsTooFarOut(false);
        } catch (err) {
          console.error("Failed to fetch forecast:", err);
        }
      } else {
        try {
          const coords = await getLatLon(destination);
          const start2024 = new Date(start); start2024.setFullYear(2024);
          const end2024 = new Date(end); end2024.setFullYear(2024);
          const response = await fetch(
            `/api/climate-averages?lat=${coords.lat}&lon=${coords.lon}&start=${start2024.toISOString().split("T")[0]}&end=${end2024.toISOString().split("T")[0]}`
          );
          const data = await response.json();
          setClimateData(data);
          setIsTooFarOut(true);
        } catch (err) {
          console.error("Failed to fetch climate data:", err);
        }
      }
    };

    fetchWeatherOrClimate();
  }, [trip]);

  const convertTemp = (tempF) =>
    unit === "F" ? `${tempF.toFixed(1)}°F` : `${(((tempF - 32) * 5) / 9).toFixed(1)}°C`;

  if (loading) {
    return (
      <Container sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your trip...</Typography>
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

  const {
    destination,
    startDate,
    endDate,
    activities,
    packingList,
    clothingSuggestions,
    localEssentials,
    travelTips,
  } = trip;

  return (
    <Container sx={{ mt: 6, pb: 8 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Trip to {destination}</Typography>
      <Typography variant="subtitle1" gutterBottom>{startDate} → {endDate}</Typography>
      <Typography variant="subtitle2" gutterBottom>Activities: {activities?.join(", ") || "None"}</Typography>

      <Box sx={{ my: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button variant="outlined" href={buildGoogleCalendarUrl({ destination, startDate, endDate })} target="_blank">
          Add to Google Calendar
        </Button>
        <ToggleButtonGroup
          value={unit}
          exclusive
          onChange={(e, newUnit) => newUnit && setUnit(newUnit)}
          size="small"
          sx={{ ml: "auto" }}
        >
          <ToggleButton value="F">°F</ToggleButton>
          <ToggleButton value="C">°C</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider sx={{ my: 3 }} />

      {forecast.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold">5-Day Weather Forecast ({unit})</Typography>
          <Box sx={{ display: "flex", gap: 2, overflowX: "auto", mt: 2 }}>
            {forecast.map((day, idx) => (
              <Paper key={idx} sx={{ minWidth: 180, p: 2, borderRadius: 3, textAlign: "center" }}>
                <Typography fontWeight="bold" sx={{ mb: 1 }}>
                  {new Date(day.time).toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric", timeZone: timezone,
                  })}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                  <img src={getWeatherIconUrl(day.values.weatherCodeMax)} alt="icon" style={{ width: 60, height: 60 }} />
                </Box>
                <Typography fontWeight="bold">
                  H: {convertTemp(day.values.temperatureMax)} / L: {convertTemp(day.values.temperatureMin)}
                </Typography>
                <Typography variant="body2">💧 {day.values.precipitationProbabilityAvg ?? 0}%</Typography>
                <Typography variant="body2">🌬 {day.values.windSpeedAvg} m/s</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {isTooFarOut && climateData.length > 0 && (
        <Box sx={{ mb: 4 }}>
        <Typography
        variant="h6"
        fontWeight="bold"
        sx={{ backgroundColor: "#fff3cd", color: "#856404", px: 2, py: 1, borderRadius: 1 }}
      >
          ⚠️ Weather Prediction Based on Historical Data
          </Typography>
          <Typography variant="body2" color="textSecondary">Based on archived data from the same dates in 2024.</Typography>
          <Box sx={{ display: "flex", gap: 2, overflowX: "auto", mt: 2 }}>
            {climateData.map((day, idx) => (
              <Paper key={idx} sx={{ minWidth: 180, p: 2, borderRadius: 3, textAlign: "center" }}>
                <Typography fontWeight="bold" sx={{ mb: 1 }}>
                  {new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric",
                  })}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                  <img
                    src={getIconForHistoricalDay(Number(day.Precipitation), (Number(day.High) * 9) / 5 + 32)}
                    alt="icon"
                    style={{ width: 60, height: 60 }}
                  />
                </Box>
                <Typography fontWeight="bold">
                H: {convertTemp((day.High * 9) / 5 + 32)} / L: {convertTemp((day.Low * 9) / 5 + 32)}
                </Typography>
                <Typography variant="body2">💧 {day.Precipitation}</Typography>
                <Typography variant="body2">🌬 {day.Wind} m/s</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      <Paper sx={{ p: 3, mb: 3 }}><Typography variant="h6" fontWeight="bold">Packing List</Typography><ReactMarkdown>{packingList}</ReactMarkdown></Paper>
      <Paper sx={{ p: 3, mb: 3 }}><Typography variant="h6" fontWeight="bold">Clothing Suggestions</Typography><ReactMarkdown>{clothingSuggestions}</ReactMarkdown></Paper>
      <Paper sx={{ p: 3, mb: 3 }}><Typography variant="h6" fontWeight="bold">Local Essentials</Typography><ReactMarkdown>{localEssentials}</ReactMarkdown></Paper>
      <Paper sx={{ p: 3 }}><Typography variant="h6" fontWeight="bold">Travel Tips</Typography><ReactMarkdown>{travelTips}</ReactMarkdown></Paper>
    </Container>
  );
}
