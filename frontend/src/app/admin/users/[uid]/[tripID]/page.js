"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  updateDoc,
  deleteDoc,
  getFirestore,
  getDocs,
} from "firebase/firestore";
import { db, default as app } from "@/app/firebase";
import {
  Container,
  Typography,
  CircularProgress,
  Paper,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Autocomplete,
  Box,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useAdminCheck } from "@/app/hooks/CheckAdmin";
import Select from "react-select";
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function TripDetailsPage() {
  const { uid, tripID } = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editTrip, setEditTrip] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const debouncedValue = useDebounce(editTrip.destination || "", 300);
  const [activitiesOptions, setActivitiesOptions] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [generationError, setGenerationError] = useState("");
  const [generating, setGenerating] = useState(false);

  const { isAdmin } = useAdminCheck();

  useEffect(() => {
    if (!isAdmin) return;

    const fetchTrip = async () => {
      const userRef = doc(collection(db, "users"), uid);
      const tripRef = doc(db, "users", uid, "trips", tripID);

      try {
        const userSnapshot = await getDoc(userRef);
        const data = userSnapshot.data();
        setUserEmail(data.email || "Email not found");

        const snapshot = await getDoc(tripRef);
        if (snapshot.exists()) {
          setTrip(snapshot.data());
          setEditTrip(snapshot.data());
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
  }, [tripID, isAdmin]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const activitiesRef = collection(db, "activities");
        const snapshot = await getDocs(activitiesRef);
        const options = snapshot.docs.map((doc) => ({
          value: doc.data().name,
          label: doc.data().name,
        }));
        setActivitiesOptions(options);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setGenerationError("Failed to load activities. Please try again.");
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedValue.length < 2) return;
      try {
        const response = await fetch(`/api/cities?q=${debouncedValue}`);
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
  }, [debouncedValue]);

  if (loading) {
    return (
      <Container sx={{ mt: 6 }}>
        <CircularProgress />
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

  if (!isAdmin) return null;

  const handleEditChange = (field) => (e, value) => {
    const inputValue =
      typeof e === "object" && e?.target ? e.target.value : value;
    setEditTrip({ ...editTrip, [field]: inputValue });
  };

  const handleActivitiesChange = (e) => {
    setEditTrip({
      ...editTrip,
      activities: e.target.value.split(",").map((s) => s.trim()),
    });
  };

  const handleSave = async () => {
    const errors = {};

    if (!editTrip.destination?.trim())    errors.destination = true;
    if (!editTrip.startDate)              errors.startDate   = true;
    if (!editTrip.endDate)                errors.endDate     = true;

    if (editTrip.startDate && editTrip.endDate) {
      const start = new Date(editTrip.startDate);
      const end   = new Date(editTrip.endDate);
      if (start > end)                     errors.dateOrder   = true;
    }

    if ((editTrip.activities || []).length === 0) errors.activities = true;

    if (Object.keys(errors).length > 0) alert("Enter information or fix invalid dates(start before end).");
    if (Object.keys(errors).length > 0) return;


    const tripRef = doc(db, "users", uid, "trips", tripID);
    try {
      await updateDoc(tripRef, editTrip);
      setTrip(editTrip);
      setEditMode(false);
    } catch (err) {
      alert("Failed to save changes: " + err.message);
    }
  };

  const handleDelete = async () => {
    const tripRef = doc(db, "users", uid, "trips", tripID);
    try {
      await deleteDoc(tripRef);
      setDeleteDialogOpen(false);
      router.push("/admin/users/" + uid);
    } catch (err) {
      alert("Failed to delete trip: " + err.message);
    }
  };

  const handleGenerateContent = async () => {
    if (
      !editTrip.destination ||
      !editTrip.startDate ||
      !editTrip.endDate ||
      !editTrip.activities?.length
    ) {
      setGenerationError(
        "Please fill in destination, dates, and at least one activity."
      );
      return;
    }

    setGenerating(true);
    setGenerationError("");

    try {
      const response = await fetch("/api/packing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: editTrip.destination,
          startDate: editTrip.startDate,
          endDate: editTrip.endDate,
          activities: editTrip.activities,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const generated = await response.json();

      setEditTrip((prev) => ({
        ...prev,
        packingList: generated.packingList,
        localEssentials: generated.localEssentials,
        travelTips: generated.travelTips,
        clothingSuggestions: generated.clothingSuggestions,
        localEtiquette: generated.localEtiquette,
      }));
    } catch (err) {
      setGenerationError("Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Container sx={{ mt: 6 }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Box sx={{ flexGrow: 1 }}>
          {editMode ? (
            <Autocomplete
              freeSolo
              options={cityOptions}
              inputValue={editTrip.destination || ""}
              onInputChange={handleEditChange("destination")}
              onChange={(e, value) =>
                value &&
                setEditTrip((prev) => ({ ...prev, destination: value }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Destination"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
              sx={{ minWidth: 250, maxWidth: 300 }}
            />
          ) : (
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {trip.destination}
            </Typography>
          )}
        </Box>
        <Button
          variant={editMode ? "contained" : "outlined"}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Cancel" : "Edit"}
        </Button>
        <Button
          color="error"
          variant="outlined"
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete Trip
        </Button>
      </Stack>

      <Typography variant="subtitle1" gutterBottom>
        {editMode ? (
          <>
            <TextField
              label="Start Date"
              type="date"
              value={editTrip.startDate}
              onChange={handleEditChange("startDate")}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ mr: 2 }}
            />
            <TextField
              label="End Date"
              type="date"
              value={editTrip.endDate}
              onChange={handleEditChange("endDate")}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </>
        ) : (
          <>
            {trip.startDate} → {trip.endDate}
          </>
        )}
      </Typography>

      <Typography variant="subtitle2" gutterBottom>
        Activities:
      </Typography>
      {editMode ? (
        <Box sx={{ mb: 2 }}>
          <Select
            isMulti
            options={activitiesOptions}
            isLoading={loadingActivities}
            value={activitiesOptions.filter((option) =>
              (editTrip.activities || []).includes(option.value)
            )}
            onChange={(selected) => {
              setEditTrip({
                ...editTrip,
                activities: selected.map((option) => option.value),
              });
            }}
            placeholder="Select activities..."
            classNamePrefix="react-select"
          />
        </Box>
      ) : (
        <Typography>
          {Array.isArray(trip.activities) ? trip.activities.join(", ") : "None"}
        </Typography>
      )}

      {editMode && (
        <>
          {generationError && (
            <Typography color="error" sx={{ mt: 1 }}>
              {generationError}
            </Typography>
          )}
          <Button
            variant="contained"
            onClick={handleGenerateContent}
            disabled={generating}
            sx={{ my: 2 }}
          >
            {generating ? "Generating..." : "Generate AI Content"}
          </Button>
        </>
      )}

      {[
        "packingList",
        "clothingSuggestions",
        "localEtiquette",
        "localEssentials",
        "travelTips",
      ].map((sectionKey, index) => (
        <Paper sx={{ p: 3, mb: 3, mt: index === 0 ? 4 : 0 }} key={sectionKey}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {sectionKey
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}
          </Typography>
          {editMode ? (
            <TextField
              value={editTrip[sectionKey] || ""}
              onChange={handleEditChange(sectionKey)}
              multiline
              minRows={4}
              fullWidth
            />
          ) : (
            <Typography>
              <ReactMarkdown>{trip[sectionKey]}</ReactMarkdown>
            </Typography>
          )}
        </Paper>
      ))}

      {editMode && (
        <Stack direction="row" spacing={2} mb={4}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Changes
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setEditTrip(trip);
              setEditMode(false);
            }}
          >
            Cancel
          </Button>
        </Stack>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Trip</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this trip? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
