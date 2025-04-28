"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Edit, Delete } from "@mui/icons-material";
import { useAdminCheck } from "@/app/hooks/CheckAdmin";
import app from "@/firebaseClient";

export default function AdminActivitiesPage() {
  const { loading, isAdmin } = useAdminCheck();
  const db = getFirestore(app);
  const activitiesCollection = collection(db, "activities");

  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    fetchActivities();
  }, [isAdmin]);

  // admin check
  if (loading) {
    return (
      <Container sx={{ mt: 6 }}>
        <CircularProgress />
      </Container>
    );
  }
  if (!isAdmin) return null;

  const fetchActivities = async () => {
    try {
      const querySnapshot = await getDocs(activitiesCollection);
      const fetchedActivities = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // alphabetical sort
      setActivities(fetchedActivities);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.trim()) return;

    try {
      await addDoc(activitiesCollection, { name: newActivity.trim() });
      setNewActivity("");
      fetchActivities(); // Refresh the list
    } catch (err) {
      console.error("Error adding activity:", err);
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await deleteDoc(doc(db, "activities", id));
      fetchActivities(); // Refresh the list
    } catch (err) {
      console.error("Error deleting activity:", err);
    }
  };

  const handleStartEdit = (activity) => {
    setEditingId(activity.id);
    setEditingName(activity.name);
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) return;

    try {
      await updateDoc(doc(db, "activities", editingId), {
        name: editingName.trim(),
      });
      setEditingId(null);
      setEditingName("");
      fetchActivities(); // Refresh the list
    } catch (err) {
      console.error("Error updating activity:", err);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Activities Management
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Add New Activity
          </Typography>
          <TextField
            fullWidth
            label="Activity Name"
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" fullWidth onClick={handleAddActivity}>
            Add Activity
          </Button>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Existing Activities
          </Typography>

          <List>
            {activities.map((activity) => (
              <ListItem key={activity.id} divider>
                {editingId === activity.id ? (
                  <>
                    <TextField
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      fullWidth
                      sx={{ mr: 2 }}
                    />
                    <Button variant="contained" onClick={handleSaveEdit}>
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <ListItemText primary={activity.name} />
                    <IconButton onClick={() => handleStartEdit(activity)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteActivity(activity.id)}
                    >
                      <Delete />
                    </IconButton>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </Box>
  );
}
