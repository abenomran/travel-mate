"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box,
} from "@mui/material";

export default function EditUserModal({ open, onClose, user, onSave }) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setPassword("");
    }
  }, [user]);

  const handleSubmit = () => {
    onSave({
      uid: user.uid,
      password,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          <TextField label="UID" value={user?.uid || ""} disabled />

          <TextField label="Email" value={user?.email || ""} disabled />

          <TextField
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
