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
  Dialog,
  DialogTitle,
  DialogContent,
  Fab,
  Tooltip,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import DownloadIcon from "@mui/icons-material/Download";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [unit, setUnit] = useState("C");
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
          const data = snapshot.data();
          setTrip(data);
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

  const handleOpenPreview = async () => {
    const element = document.getElementById("trip-content");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    setPreviewImage(imgData);
    setPreviewOpen(true);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("trip-content");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
  
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
  
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;
  
    // Scale factor between px and mm
    const ratio = imgWidth / canvasWidth;
  
    // Height in px of one PDF page (after header space)
    const pageHeightPx = (pdfHeight - 20) / ratio;
  
    let position = 20;
  
    pdf.setFontSize(14);
    const Msg = `Hey! I'm planning a trip to ${trip.destination} using TravelMate.`;
    pdf.text(Msg, 10, 15);
  
    let pageCanvas, pageCtx, imgChunk;
    let remainingHeight = canvasHeight;
    let offset = 0;
  
    while (remainingHeight > 0) {
      const sliceHeight = Math.min(pageHeightPx, remainingHeight);
  
      // Create new canvas for the slice
      pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvasWidth;
      pageCanvas.height = sliceHeight;
  
      pageCtx = pageCanvas.getContext("2d");
      pageCtx.drawImage(
        canvas,
        0, offset, // source x, y
        canvasWidth, sliceHeight, // source width, height
        0, 0, // destination x, y
        canvasWidth, sliceHeight // destination width, height
      );
  
      imgChunk = pageCanvas.toDataURL("image/png");
      pdf.addImage(imgChunk, "PNG", 0, position, imgWidth, sliceHeight * ratio);
  
      remainingHeight -= sliceHeight;
      offset += sliceHeight;
  
      if (remainingHeight > 0) {
        pdf.addPage();
        position = 0;
      }
    }
  
    pdf.save("travelmate-trip.pdf");
  };  

  useEffect(() => {
    if (!trip) return;

    const fetchWeatherOrClimate = async () => {
      const { destination, startDate, endDate } = trip;
      const location = encodeURIComponent(destination.trim());
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();
      const MS_PER_DAY = 1000 * 60 * 60 * 24;

      const fiveDaysFromNow = new Date(now.getTime() + 5 * MS_PER_DAY);

      const isSoon =
        end >= now && start <= fiveDaysFromNow;

      if (isSoon) {
        try {
          const response = await fetch(
            `https://api.tomorrow.io/v4/weather/forecast?location=${location}&apikey=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&startTime=${start.toISOString()}&endTime=${end.toISOString()}`
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
    localEtiquette,
    travelTips,
  } = trip;

  return (
    <Container sx={{ mt: 6, pb: 8 }}>
      <Box sx={{ textAlign: "right", mb: 2 }}>
        <Button variant="contained" onClick={handleOpenPreview}>
          View Preview
        </Button>
      </Box>
      <div id="trip-content">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Trip to {destination}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          {trip.startDate} → {trip.endDate}
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          Activities:{" "}
          {Array.isArray(trip.activities) ? trip.activities.join(", ") : "None"}
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
                      crossOrigin="anonymous"
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
            The trip dates are too far in the future or already passed to show an accurate weather forecast.
          </Typography>
        </Box>
      ) : null}

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
          Local Etiquette
        </Typography>
        <ReactMarkdown>{localEtiquette}</ReactMarkdown>
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
    </div>
    <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Trip Preview</DialogTitle>
        <DialogContent>
          {previewImage && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <img
                src={previewImage}
                alt="Trip Preview"
                style={{ maxWidth: "100%", borderRadius: "8px" }}
              />
            </Box>
          )}
        </DialogContent>

        <Box sx={{ position: "absolute", bottom: 16, right: 24 }}>
          <Tooltip title="Download">
            <Fab color="primary" onClick={handleDownloadPDF}>
              <DownloadIcon />
            </Fab>
          </Tooltip>
        </Box>
      </Dialog>
    </Container>
  );
}