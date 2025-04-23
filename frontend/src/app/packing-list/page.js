"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Divider,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { auth, db } from "../firebase";
import { collection, doc, addDoc, serverTimestamp } from "firebase/firestore";

export default function PackingListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destination = searchParams.get("destination");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const activities = searchParams.get("activities")?.split(",") || [];

  const [packingList, setPackingList] = useState("");
  const [travelTips, setTravelTips] = useState("");
  const [localEtiquette, setLocalEtiquette] = useState("");
  const [localEssentials, setLocalEssentials] = useState("");
  const [clothingSuggestions, setClothingSuggestions] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);


  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchPackingData = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

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

        setPackingList(data.packingList || "No packing list returned.");
        setTravelTips(data.travelTips || "No travel tips available.");
        setLocalEtiquette(
          data.localEtiquette || "No local etiquette provided.");
        setLocalEssentials(
          data.localEssentials || "No local essentials listed."
        );
        setClothingSuggestions(
          data.clothingSuggestions || "No clothing suggestions provided."
        );
        setError("");
      } catch (err) {
        console.log("Packing list error:", err);
        setError("Failed to generate packing information. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (
      !hasFetched.current &&
      destination &&
      start &&
      end &&
      activities.length > 0
    ) {
      hasFetched.current = true;
      fetchPackingData();
    }
  }, [destination, start, end, activities]);

  const handleSaveTrip = async () => {
    setSaving(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      const uid = user.uid;

      const tripData = {
        destination,
        startDate: start,
        endDate: end,
        activities,
        packingList,
        travelTips,
        localEtiquette,
        localEssentials,
        clothingSuggestions,
        createdAt: serverTimestamp(),
      };

      const tripsRef = collection(doc(collection(db, "users"), uid), "trips");
      const newTripDoc = await addDoc(tripsRef, tripData);

      console.log("ID:", newTripDoc.id);
      router.push(`/trip/${newTripDoc.id}`);
    } catch (err) {
      console.log("Save trip error:", err);
      setError("Failed to save trip.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Your Smart Trip Suggestions
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          For your trip to{" "}
          <Typography component="span" fontWeight="bold">
            {destination}
          </Typography>{" "}
          from{" "}
          <Typography component="span" fontWeight="bold">
            {start}
          </Typography>{" "}
          to{" "}
          <Typography component="span" fontWeight="bold">
            {end}
          </Typography>
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
          <>
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Packing List
              </Typography>
              <ReactMarkdown>{packingList}</ReactMarkdown>
            </Paper>

            <Divider sx={{ my: 4 }} />

            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Clothing Suggestions
              </Typography>
              <ReactMarkdown>{clothingSuggestions}</ReactMarkdown>
            </Paper>

            <Divider sx={{ my: 4 }} />

            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Local Etiquette
              </Typography>
              <ReactMarkdown>{localEtiquette}</ReactMarkdown>
            </Paper>

            <Divider sx={{ my: 4 }} />

            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Local Essentials
              </Typography>
              <ReactMarkdown>{localEssentials}</ReactMarkdown>
            </Paper>

            <Divider sx={{ my: 4 }} />

            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Travel Tips
              </Typography>
              <ReactMarkdown>{travelTips}</ReactMarkdown>
            </Paper>
          </>
        )}
        {!loading && !error && (
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              onClick={handleSaveTrip}
              disabled={saving}
              style={{
                padding: "12px 24px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "16px",
                cursor: "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving..." : "Save Trip"}
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
