"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleGetStarted = () => {
    if (user) {
      router.push("/get-started");
    } else {
      router.push("/signin?redirect=/get-started");
    }
  };

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", minHeight: "100vh", py: 6 }}>
      {/* Hero */}
      <Container maxWidth="lg">
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          TravelMate
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Plan smarter. Pack better. Travel easier.
        </Typography>
        <Button variant="contained" sx={{ mt: 3 }} onClick={handleGetStarted}>
          Get Started
        </Button>
      </Container>
      {/* How It Works */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={4}>
          {[
            { label: "Enter Destination", path: "/get-started" },
            { label: "Get Weather Forecast", path: " " },
            { label: "Receive Packing List", path: "/packing" },
          ].map((step, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Link href={step.path} passHref>
                <Card
                  component="a"
                  sx={{
                    textDecoration: "none",
                    cursor: "pointer",
                    display: "block",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      Step {idx + 1}
                    </Typography>
                    <Typography>{step.label}</Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
      {/* Traveler Profiles */}
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Who’s It For?
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  Casual Travelers
                </Typography>
                <Typography>
                  Simple and guided experience. Get packing help tailored for
                  leisure trips.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  Business Travelers
                </Typography>
                <Typography>
                  Smart outfit suggestions and quick access to saved trips for
                  frequent flyers.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      {/* Features */}
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          {[
            "Weather-based outfit recommendations",
            "Customizable packing lists",
            "Real-time weather updates",
            "Travel tips & cultural insights",
            "Trip history & preferences",
          ].map((feature, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card>
                <CardContent>
                  <Typography>{feature}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      {/* Final CTA */}
      <Container maxWidth="lg" sx={{ textAlign: "center", mt: 12 }}>
        <Typography variant="h5" fontWeight="bold">
          Ready to plan your next trip?
        </Typography>
        <Link href={`/signup`}>
          <Button variant="contained" size="large" sx={{ mt: 3 }}>
            Sign Up Now
          </Button>
        </Link>
      </Container>
    </Box>
  );
}
