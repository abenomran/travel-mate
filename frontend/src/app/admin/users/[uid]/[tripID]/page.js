"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import {
  Container, Typography, CircularProgress, Paper,
  TextField, Button, Stack, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { useAdminCheck } from "@/app/hooks/CheckAdmin";

export default function TripDetailsPage() {
  const { uid, tripID } = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editTrip, setEditTrip] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const handleEditChange = (field) => (e) => {
    setEditTrip({ ...editTrip, [field]: e.target.value });
  };

  const handleActivitiesChange = (e) => {
    setEditTrip({ ...editTrip, activities: e.target.value.split(",").map(s => s.trim()) });
  };

  const handleSave = async () => {
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

  return (
    <Container sx={{ mt: 6 }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {editMode ? (
            <TextField
              label="Destination"
              value={editTrip.destination}
              onChange={handleEditChange("destination")}
              variant="outlined"
              size="small"
            />
          ) : (
            trip.destination
          )}
        </Typography>
        <Button variant={editMode ? "contained" : "outlined"} onClick={() => setEditMode(!editMode)}>
          {editMode ? "Cancel" : "Edit"}
        </Button>
        <Button color="error" variant="outlined" onClick={() => setDeleteDialogOpen(true)}>
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
        Activities:{" "}
        {editMode ? (
          <TextField
            value={Array.isArray(editTrip.activities) ? editTrip.activities.join(", ") : ""}
            onChange={handleActivitiesChange}
            variant="outlined"
            size="small"
            sx={{ minWidth: 300 }}
          />
        ) : (
          Array.isArray(trip.activities) ? trip.activities.join(", ") : "None"
        )}
      </Typography>

      <Paper sx={{ p: 3, mb: 3, mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Packing List
        </Typography>
        {editMode ? (
          <TextField
            value={editTrip.packingList}
            onChange={handleEditChange("packingList")}
            multiline
            minRows={4}
            fullWidth
          />
        ) : (
          <Typography>
            <ReactMarkdown>{trip.packingList}</ReactMarkdown>
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3, mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Clothing Suggestions
        </Typography>
        {editMode ? (
          <TextField
            value={editTrip.clothingSuggestions}
            onChange={handleEditChange("clothingSuggestions")}
            multiline
            minRows={4}
            fullWidth
          />
        ) : (
          <Typography>
            <ReactMarkdown>{trip.clothingSuggestions}</ReactMarkdown>
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Local Essentials
        </Typography>
        {editMode ? (
          <TextField
            value={editTrip.localEssentials}
            onChange={handleEditChange("localEssentials")}
            multiline
            minRows={4}
            fullWidth
          />
        ) : (
          <Typography>
            <ReactMarkdown>{trip.localEssentials}</ReactMarkdown>
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Travel Tips
        </Typography>
        {editMode ? (
          <TextField
            value={editTrip.travelTips}
            onChange={handleEditChange("travelTips")}
            multiline
            minRows={4}
            fullWidth
          />
        ) : (
          <Typography>
            <ReactMarkdown>{trip.travelTips}</ReactMarkdown>
          </Typography>
        )}
      </Paper>

      {editMode && (
        <Stack direction="row" spacing={2} mb={4}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save Changes
          </Button>
          <Button variant="outlined" onClick={() => { setEditTrip(trip); setEditMode(false); }}>
            Cancel
          </Button>
        </Stack>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Trip</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this trip? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}