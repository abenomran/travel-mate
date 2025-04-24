"use client";

import { AppBar, Toolbar, Typography, Button, Box, IconButton } from "@mui/material";
import { FlightTakeoff, Explore, AccountCircle, Logout, Login, PersonAdd, Person } from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const MainNavbar = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const safeRedirect =
    pathname === "/signin" || pathname === "/signup" ? "/" : pathname;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out:", user);
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#0F172A", px: 3, py: 0.5 }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left: Logo + Links */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <IconButton edge="start" color="inherit" href="/" sx={{ p: 0 }}>
            <FlightTakeoff sx={{ color: "#3B82F6", mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ color: "white", fontWeight: 600 }}>
              TravelMate
            </Typography>
          </IconButton>

          <Link href="/" passHref>
            <Button startIcon={<Explore />} sx={navButtonStyle}>
              Home
            </Button>
          </Link>
          <Link href="/about" passHref>
            <Button startIcon={<Person />} sx={navButtonStyle}> About </Button>
          </Link>
        </Box>

        {/* Right: Auth Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user ? (
            <>
              <Link href="/trips" passHref>
                <Button sx={navButtonStyle} startIcon={<AccountCircle />}>
                  My Trips
                </Button>
              </Link>
              <Button
                onClick={handleSignOut}
                startIcon={<Logout />}
                sx={{
                  ...navButtonStyle,
                  backgroundColor: "#EF4444",
                  "&:hover": { backgroundColor: "#DC2626" },
                  color: "white",
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href={`/signin?redirect=${encodeURIComponent(safeRedirect)}`} passHref>
                <Button startIcon={<Login />} sx={navButtonStyle}>
                  Sign In
                </Button>
              </Link>
              <Link href={`/signup?redirect=${encodeURIComponent(safeRedirect)}`} passHref>
                <Button
                  startIcon={<PersonAdd />}
                  sx={{
                    ...navButtonStyle,
                    border: "1px solid #3B82F6",
                    backgroundColor: "#FFFFFF",
                    color: "#3B82F6",
                    "&:hover": {
                      backgroundColor: "#DBEAFE",
                    },
                  }}
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const navButtonStyle = {
  backgroundColor: "#3B82F6",
  color: "#FFFFFF",
  textTransform: "none",
  fontWeight: 500,
  "&:hover": {
    backgroundColor: "#2563EB",
  },
};

export default MainNavbar;