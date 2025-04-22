"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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
  return icons[code] || icons[1000];
};

const buildGoogleCalendarUrl = ({ destination, startDate, endDate }) => {
  const formatDate = (d) =>
    new Date(d).toISOString().replace(/[-:]|(\.\d{3})/g, "").slice(0, 15);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE` +
    `&text=Trip+to+${encodeURIComponent(destination)}` +
    `&dates=${formatDate(startDate)}/${formatDate(endDate)}` +
    `&details=${encodeURIComponent("Planned using BrainBridge!")}` +
    `&location=${encodeURIComponent(destination)}`;
};

export default function TripDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState([]);
  const [climateData, setClimateData] = useState([]);
  const [unit, setUnit] = useState("C");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [thingsToDo, setThingsToDo] = useState("");
  const [isTooFarOut, setIsTooFarOut] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const tripRef = doc(db, "users", user.uid, "trips", id);
        const snapshot = await getDoc(tripRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setTrip(data);
          setThingsToDo(data.thingsToDo || "");
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
      const { destination, startDate } = trip;
      const location = encodeURIComponent(destination.trim());
      const start = new Date(startDate);
      const today = new Date();
      const isSoon = (start - today) / (1000 * 60 * 60 * 24) <= 10;

      if (isSoon) {
        try {
          const response = await fetch(
            `https://api.tomorrow.io/v4/weather/forecast?location=${location}&apikey=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&startTime=${start.toISOString()}`
          );
          const data = await response.json();
          setTimezone(data.location.tz);
          const forecastSlice = data.timelines.daily.filter(
            (d) => new Date(d.time) >= start
          );
          setForecast(forecastSlice.slice(0, 5));
        } catch (err) {
          console.error("Failed to fetch weather:", err);
        }
      } else {
        setIsTooFarOut(true);
        try {
          const cityOnly = destination.split(",")[0];
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityOnly}`);
          const geoData = await geoRes.json();
          const coords = geoData.results?.[0];
          if (!coords) return;

          setTimezone(coords.timezone);

          const climateRes = await fetch(
            `https://climate-api.open-meteo.com/v1/climate?latitude=${coords.latitude}&longitude=${coords.longitude}&start_year=1991&end_year=2020&temperature_unit=celsius`
          );
          const climate = await climateRes.json();
          const monthIndex = new Date(startDate).getMonth();
          const monthData = climate.monthly[monthIndex];

          setClimateData([
            {
              name: new Date(startDate).toLocaleString("default", { month: "long" }),
              High: monthData.temperature_2m_max,
              Low: monthData.temperature_2m_min,
              Precipitation: monthData.precipitation_sum,
            },
          ]);
        } catch (err) {
          console.error("Failed to fetch climate data:", err);
        }
      }
    };

    fetchWeatherOrClimate();
  }, [trip]);

  const convertTemp = (tempC) =>
    unit === "C" ? `${tempC}°C` : `${((tempC * 9) / 5 + 32).toFixed(1)}°F`;

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
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Trip to {destination}
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        {new Date(startDate).toLocaleString("en-US", { timeZone: timezone, dateStyle: "medium" })} →{" "}
        {new Date(endDate).toLocaleString("en-US", { timeZone: timezone, dateStyle: "medium" })}
      </Typography>

      <Typography variant="subtitle2" gutterBottom>
        Activities: {activities?.join(", ") || "None"}
      </Typography>

      <Box sx={{ my: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          href={buildGoogleCalendarUrl({ destination, startDate, endDate })}
          target="_blank"
        >
          Add to Google Calendar
        </Button>

        <ToggleButtonGroup
          value={unit}
          exclusive
          onChange={(e, newUnit) => newUnit && setUnit(newUnit)}
          size="small"
          sx={{ ml: "auto" }}
        >
          <ToggleButton value="C">°C</ToggleButton>
          <ToggleButton value="F">°F</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider sx={{ my: 3 }} />

      {forecast.length > 0 ? (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            5-Day Weather Forecast ({unit})
          </Typography>

          <Box sx={{ overflowX: "auto", whiteSpace: "nowrap", mt: 2 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              {forecast.map((day, idx) => (
                <Paper
                  key={idx}
                  sx={{
                    minWidth: 180,
                    maxWidth: 180,
                    flexShrink: 0,
                    p: 2,
                    borderRadius: 3,
                    textAlign: "center",
                  }}
                >
                  <Typography fontWeight="bold" sx={{ mb: 1 }}>
                    {new Date(day.time).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      timeZone: timezone,
                    })}
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                    <img
                      src={getWeatherIconUrl(day.values.weatherCodeMax)}
                      alt="icon"
                      style={{ width: 60, height: 60, objectFit: "contain" }}
                    />
                  </Box>
                  <Typography fontWeight="bold">
                    H: {convertTemp(day.values.temperatureMax)} / L: {convertTemp(day.values.temperatureMin)}
                  </Typography>
                  <Typography variant="body2">
                    💧 {day.values.precipitationProbabilityAvg ?? 0}%
                  </Typography>
                  <Typography variant="body2">
                    🌬 {day.values.windSpeedAvg} m/s
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Box>
      ) : isTooFarOut ? (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Weather Forecast Unavailable
          </Typography>
          <Typography variant="body2">
            The trip dates are too far in the future to show an accurate weather forecast.
          </Typography>
        </Box>
      ) : null}

      {climateData.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Climate Trends ({unit})
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
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

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Things To Do
        </Typography>
        <ReactMarkdown>{thingsToDo}</ReactMarkdown>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Packing List
        </Typography>
        <ReactMarkdown>{packingList}</ReactMarkdown>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Clothing Suggestions
        </Typography>
        <ReactMarkdown>{clothingSuggestions}</ReactMarkdown>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Local Essentials
        </Typography>
        <ReactMarkdown>{localEssentials}</ReactMarkdown>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Travel Tips
        </Typography>
        <ReactMarkdown>{travelTips}</ReactMarkdown>
      </Paper>
    </Container>
  );
}
