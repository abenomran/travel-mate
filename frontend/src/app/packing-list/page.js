"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import ReactMarkdown from "react-markdown";

export default function PackingListPage() {
  const searchParams = useSearchParams();
  const destination = searchParams.get("destination");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const activities = searchParams.get("activities")?.split(",") || [];

  const [packingList, setPackingList] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasFetched = useRef(false); // ✅ Prevent repeated calls

  useEffect(() => {
    const fetchPackingList = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/packing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination,
            startDate: start,
            endDate: end,
            activities,
          }),
        });

        const data = await response.json();
        setPackingList(data.list || "No packing list returned.");
        setError("");
      } catch (err) {
        console.error("Packing list error:", err);
        setError("Failed to generate packing list. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (!hasFetched.current && destination && start && end && activities.length > 0) {
      hasFetched.current = true;
      fetchPackingList();
    }
  }, [destination, start, end, activities]);

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Your Smart Packing List
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          For your trip to <strong>{destination}</strong> from{" "}
          <strong>{start}</strong> to <strong>{end}</strong>
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          Activities: {activities.join(", ") || "None selected"}
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Generating your list...</Typography>
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ mt: 4 }}>
            {error}
          </Typography>
        ) : (
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <ReactMarkdown>{packingList}</ReactMarkdown>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
