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

        const res = await fetch("/api/packing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination, startDate: start, endDate: end, activities }),
        });
        const data = await res.json();

        setPackingList(data.packingList || "Sorry, no packing list available due to high traffic.");
        setClothingSuggestions(data.clothingSuggestions || "Sorry, no clothing suggestions available due to high traffic.");
        setLocalEtiquette(data.localEtiquette || "Sorry, no local etiquette available due to high traffic.");
        setLocalEssentials(data.localEssentials || "Sorry, no local essentials available due to high traffic.");
        setTravelTips(data.travelTips || "Sorry, no travel tips available due to high traffic.");
        setError("");
      } catch (err) {
        console.error(err);
        setError("Oops! Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    if (!hasFetched.current && destination && start && end && activities.length) {
      hasFetched.current = true;
      fetchPackingData();
    }
  }, [destination, start, end, activities]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not signed in");
      const uid = user.uid;
      const tripData = {
        destination,
        startDate: start,
        endDate: end,
        activities,
        packingList,
        clothingSuggestions,
        localEtiquette,
        localEssentials,
        travelTips,
        createdAt: serverTimestamp(),
      };
      const userTrips = collection(doc(collection(db, "users"), uid), "trips");
      const docRef = await addDoc(userTrips, tripData);
      router.push(`/trip/${docRef.id}`);
    } catch (err) {
      console.error(err);
      setError("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const section = (title, content) => (
    <Paper
      elevation={2}
      sx={{ p: 3, mt: 3, borderRadius: 2, bgcolor: 'background.paper' }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
        {title}
      </Typography>
      <ReactMarkdown>{content}</ReactMarkdown>
    </Paper>
  );

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg,rgb(216, 243, 250) 0%,rgb(178, 227, 255) 100%)',
        minHeight: '100vh',
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h4"
            align="center"
            sx={{ fontWeight: 'bold', color: '#333' }}
            gutterBottom
          >
            Your Smart Trip Suggestions
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ color: '#555' }}>
            {`To ${destination} | ${start} → ${end}`}
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: '#777', mb: 2 }}>
            {activities.length ? `Activities: ${activities.join(', ')}` : 'No activities'}
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2, color: '#555' }}>Preparing your suggestions…</Typography>
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ mt: 4, textAlign: 'center' }}>
              {error}
            </Typography>
          ) : (
            <>
              {section('Packing List', packingList)}
              <Divider sx={{ my: 3 }} />
              {section('Clothing Suggestions', clothingSuggestions)}
              <Divider sx={{ my: 3 }} />
              {section('Local Etiquette', localEtiquette)}
              <Divider sx={{ my: 3 }} />
              {section('Local Essentials', localEssentials)}
              <Divider sx={{ my: 3 }} />
              {section('Travel Tips', travelTips)}

              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ borderRadius: 2 }}
                >
                  {saving ? <CircularProgress size={24} /> : 'Save Trip'}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
