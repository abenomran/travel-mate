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
} from "@mui/material";
import Select from 'react-select';

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
  });
  const [formErrors, setFormErrors] = useState({});
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [activitiesOptions, setActivitiesOptions] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

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
        localEssentials: generated.localEssentials,
        travelTips: generated.travelTips,
        clothingSuggestions: generated.clothingSuggestions,
      }));
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
            <TextField
              label="Destination"
              value={newTrip.destination}
              onChange={(e) =>
                setNewTrip({ ...newTrip, destination: e.target.value })
              }
              error={formErrors.destination}
              helperText={formErrors.destination && "Required"}
              fullWidth
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
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Packing List
          </Typography>
          <TextField
            value={newTrip.packingList}
            onChange={(e) =>
              setNewTrip({ ...newTrip, packingList: e.target.value })
            }
            multiline
            minRows={4}
            fullWidth
          />
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Clothing Suggestions
          </Typography>
          <TextField
            value={newTrip.clothingSuggestions}
            onChange={(e) =>
              setNewTrip({ ...newTrip, clothingSuggestions: e.target.value })
            }
            multiline
            minRows={4}
            fullWidth
          />
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Local Essentials
          </Typography>
          <TextField
            value={newTrip.localEssentials}
            onChange={(e) =>
              setNewTrip({ ...newTrip, localEssentials: e.target.value })
            }
            multiline
            minRows={4}
            fullWidth
          />
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Travel Tips
          </Typography>
          <TextField
            value={newTrip.travelTips}
            onChange={(e) =>
              setNewTrip({ ...newTrip, travelTips: e.target.value })
            }
            multiline
            minRows={4}
            fullWidth
          />
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