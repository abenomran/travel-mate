"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Typography,
  Autocomplete,
} from "@mui/material";
import Select from "react-select";

// Debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function CreateTripDialog({ open, onClose, onCreate }) {
  const [newTrip, setNewTrip] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    activities: [],
    packingList: "",
    localEssentials: "",
    travelTips: "",
    clothingSuggestions: "",
    localEtiquette: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [activitiesOptions, setActivitiesOptions] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [cityOptions, setCityOptions] = useState([]);
  const debouncedDestination = useDebounce(newTrip.destination, 300);

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
    const fetchCitySuggestions = async () => {
      if (debouncedDestination.length < 2) return;
      try {
        const response = await fetch(`/api/cities?q=${debouncedDestination}`);
        const data = await response.json();
        const options = data.data.map(
          (city) => `${city.city}, ${city.regionCode}, ${city.countryCode}`
        );
        setCityOptions(options.sort());
      } catch (err) {
        console.error("City autocomplete failed:", err);
      }
    };
    fetchCitySuggestions();
  }, [debouncedDestination]);

  const validateBasicFields = () => {
    const errors = {};
    if (!newTrip.destination) errors.destination = true;
    if (!newTrip.startDate) errors.startDate = true;
    if (!newTrip.endDate) errors.endDate = true;
    if (newTrip.activities.length === 0) errors.activities = true;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerateContent = async () => {
    if (!validateBasicFields()) return;

    setGenerating(true);
    setGenerationError("");
    try {
      const response = await fetch("/api/packing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: newTrip.destination,
          startDate: newTrip.startDate,
          endDate: newTrip.endDate,
          activities: newTrip.activities,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const generated = await response.json();
      setNewTrip((prev) => ({
        ...prev,
        packingList: generated.packingList,
        localEtiquette: generated.localEtiquette,
        localEssentials: generated.localEssentials,
        travelTips: generated.travelTips,
        clothingSuggestions: generated.clothingSuggestions,
      }));
      console.log("Generated content:", generated);
    } catch (err) {
      setGenerationError("Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!validateBasicFields()) return;

    onCreate({
      ...newTrip,
      createdAt: new Date().toISOString(),
    });
    setNewTrip({
      destination: "",
      startDate: "",
      endDate: "",
      activities: [],
      packingList: "",
      localEssentials: "",
      travelTips: "",
      clothingSuggestions: "",
      localEtiquette: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create New Trip</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {generationError && <Alert severity="error">{generationError}</Alert>}

          <Stack direction="row" spacing={2}>
            <Autocomplete
              freeSolo
              options={cityOptions}
              inputValue={newTrip.destination}
              onInputChange={(e, value) =>
                setNewTrip((prev) => ({ ...prev, destination: value }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Destination"
                  error={formErrors.destination}
                  helperText={formErrors.destination && "Required"}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
              sx={{ minWidth: 250, maxWidth: 300 }}
            />
            <TextField
              label="Start Date"
              type="date"
              value={newTrip.startDate}
              onChange={(e) =>
                setNewTrip({ ...newTrip, startDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              error={formErrors.startDate}
              helperText={formErrors.startDate && "Required"}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={newTrip.endDate}
              onChange={(e) =>
                setNewTrip({ ...newTrip, endDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              error={formErrors.endDate}
              helperText={formErrors.endDate && "Required"}
              fullWidth
            />
          </Stack>

          <div>
            <label>Activities *</label>
            <Select
              isMulti
              options={activitiesOptions}
              value={newTrip.activities.map((activity) => ({
                value: activity,
                label: activity,
              }))}
              onChange={(selected) => {
                setNewTrip({
                  ...newTrip,
                  activities: selected.map((option) => option.value),
                });
              }}
              isLoading={loadingActivities}
              placeholder="Select activities..."
              classNamePrefix="react-select"
              className={
                formErrors.activities
                  ? "react-select-container is-invalid"
                  : "react-select-container"
              }
            />
            {formErrors.activities && (
              <div className="invalid-feedback d-block">
                At least one activity is required
              </div>
            )}
          </div>

          <Button
            variant="contained"
            onClick={handleGenerateContent}
            disabled={generating}
            sx={{ py: 1.5 }}
          >
            {generating ? (
              <CircularProgress size={24} />
            ) : (
              "Generate AI Content"
            )}
          </Button>

          {[
            "Packing List",
            "Clothing Suggestions",
            "Local Etiquette",
            "Local Essentials",
            "Travel Tips",
          ].map((label) => {
            const toCamelCase = (str) =>
              str
                .toLowerCase()
                .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
                  index === 0 ? word.toLowerCase() : word.toUpperCase()
                )
                .replace(/\s+/g, "");

            const fieldKey = toCamelCase(label);

            return (
              <div key={fieldKey}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {label}
                </Typography>
                <TextField
                  value={newTrip[fieldKey]}
                  onChange={(e) =>
                    setNewTrip({ ...newTrip, [fieldKey]: e.target.value })
                  }
                  multiline
                  minRows={4}
                  fullWidth
                />
              </div>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained" color="primary">
          Create Trip
        </Button>
      </DialogActions>
    </Dialog>
  );
}
