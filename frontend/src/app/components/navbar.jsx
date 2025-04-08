// components/Navbar.js
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Link from "next/link";

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#1E293B", px: 2 }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left: Logo + Links */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ color: "#FFFFFF" }}>
            TravelMate
          </Typography>

          <Link href="/" passHref>
            <Button
              sx={{
                backgroundColor: "#3B82F6",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#2563EB",
                },
              }}
            >
              Home
            </Button>
          </Link>

          <Link href="/about" passHref>
            <Button
              sx={{
                backgroundColor: "#3B82F6",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#2563EB",
                },
              }}
            >
              About
            </Button>
          </Link>

          <Link href="/contact" passHref>
            <Button
              sx={{
                backgroundColor: "#3B82F6",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#2563EB",
                },
              }}
            >
              Contact
            </Button>
          </Link>
        </Box>

        {/* Right: Auth buttons */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Link href="/signin" passHref>
            <Button
              sx={{
                backgroundColor: "#F1F5F9",
                color: "#1E293B",
                "&:hover": {
                  backgroundColor: "#E2E8F0",
                },
              }}
            >
              Sign In
            </Button>
          </Link>
          <Link href="/signup" passHref>
            <Button
              sx={{
                backgroundColor: "#F1F5F9",
                color: "#1E293B",
                border: "1px solid #1E293B",
                "&:hover": {
                  backgroundColor: "#E2E8F0",
                },
              }}
            >
              Sign Up
            </Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
