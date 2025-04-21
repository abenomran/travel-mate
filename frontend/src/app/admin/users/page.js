"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import { IconButton, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditUserModal from "@/app/components/EditUserModal";
import { useAdminCheck } from "@/app/hooks/CheckAdmin";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // edit states
  const [editingUser, setEditingUser] = useState(null);

  // admin check values
  const { loading, isAdmin } = useAdminCheck();

  // Fetch users
  useEffect(() => {
    if (!isAdmin) return; // admin check (skip fetch)

    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, [isAdmin]);

  // admin check return
  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return null;

  // Create user
  const handleCreate = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setEmail("");
      setPassword("");

      // Refresh user list
      const refreshRes = await fetch("/api/admin/users");
      const refreshData = await refreshRes.json();
      setUsers(refreshData);
    } catch (err) {
      console.error("Create failed:", err.message);
      alert(`Error: ${err.message}`);
    }
  };

  // Delete user
  const handleDelete = async (uid) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      const data = await res.json();

      if (!res.ok) {
        // extract and throw error if response failed
        throw new Error(data.error || "Failed to delete user");
      }

      // update UI for user deletion (not backend dependent; doesn't actually refetch)
      setUsers(users.filter((user) => user.uid !== uid));
    } catch (err) {
      console.error("Delete failed:", err.message);
      alert(`Error: ${err.message}`);
    }
  };

  // Edit user prompts (through modal)
  const handleEdit = (user) => setEditingUser(user);

  // actually edit the firebase user
  const handleSaveEdit = async (updateData) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");

      setEditingUser(null);

      // Refresh list
      const refreshed = await fetch("/api/admin/users");
      setUsers(await refreshed.json());
    } catch (err) {
      console.error("Edit failed:", err.message);
      alert(`Error: ${err.message}`);
    }
  };

  // filter admins/regular users
  const adminUsers = users.filter((user) => user.role === "admin");
  const regularUsers = users.filter((user) => user.role !== "admin");

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Users
      </Typography>

      {/* Create User */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box display="flex" alignItems="center">
          <Box display="flex" alignItems="center" flexGrow={1} gap={2}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mr: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mr: 2 }}
            />
            <Button variant="contained" onClick={handleCreate}>
              Create User
            </Button>
          </Box>
          <Tooltip title="Refresh">
            <IconButton
              onClick={async () => {
                const res = await fetch("/api/admin/users");
                const data = await res.json();
                setUsers(data);
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Admins Table */}
      <Box mb={6}>
        <Typography variant="h6" gutterBottom>
          Admins
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>UID</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adminUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.uid}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        href={`/admin/users/${user.uid}`}
                      >
                        Trips
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(user.uid)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Regular Users Table */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Users
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>UID</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {regularUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.uid}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        href={`/admin/users/${user.uid}`}
                      >
                        Trips
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(user.uid)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <EditUserModal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSave={handleSaveEdit}
      />
    </Container>
  );
}
