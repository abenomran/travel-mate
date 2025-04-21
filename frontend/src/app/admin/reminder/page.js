"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import app from "@/firebaseClient";
import { useAdminCheck } from "@/app/hooks/CheckAdmin";

export default function AdminReminderTemplatePage() {
  const { isAdmin } = useAdminCheck();
  const db = getFirestore(app);
  // Store the template at /templates/reminderTemplate
  const templateDocRef = doc(db, "templates", "reminderTemplate");

  const [template, setTemplate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (!isAdmin) return;

    fetchTemplate();
    // eslint-disable-next-line
  }, [isAdmin]);

  if (!isAdmin) return null;

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const docSnap = await getDoc(templateDocRef);
      if (docSnap.exists()) {
        setTemplate(docSnap.data().text || "");
      } else {
        setTemplate("");
      }
    } catch (err) {
      console.error("Error fetching template:", err);
      setSnackbar({
        open: true,
        message: "Error loading template.",
        severity: "error",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(templateDocRef, { text: template });
      setSnackbar({
        open: true,
        message: "Template saved!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error saving template:", err);
      setSnackbar({
        open: true,
        message: "Error saving template.",
        severity: "error",
      });
    }
    setSaving(false);
  };

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Reminder Template Editor
        </Typography>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Edit Reminder Template
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <TextField
                multiline
                rows={6}
                fullWidth
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  sx: {
                    "& textarea": {
                      resize: "vertical",
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                fullWidth
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </Paper>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
