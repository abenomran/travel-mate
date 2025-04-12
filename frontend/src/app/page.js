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
  CardMedia,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3272FF",
      light: "#6B9DFF",
      dark: "#0046D1",
    },
    background: {
      default: "#F0F2FF",
      paper: "rgba(255, 255, 255, 0.8)",
    },
  },
  typography: {
    fontFamily: '"Outfit", sans-serif',
    h2: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
});

const steps = [
  {
    label: "Enter Destination",
    path: "/get-started",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSrwt-QkdEOYV_1H1c6MZtPyEYDycUKsH_LA&s",
  },
  {
    label: "Plan Activities",
    path: "/get-started",
    image: "https://assets.hvmag.com/2024/05/zipline-guide-1068x712.jpg",
  },
  {
    label: "Receive Packing List",
    path: "/get-started",
    image:
      "https://res.cloudinary.com/tripactions/image/upload/f_auto/q_auto/v1675108641/cms/blogs/6_Packing_Tips_for_Bleisure_Trips_p8quac.webp",
  },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) =>
      setUser(currentUser)
    );
    return unsubscribe;
  }, []);

  const handleGetStarted = () => {
    router.push(user ? "/get-started" : "/signin?redirect=/get-started");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <Box
          sx={{
            backgroundImage:
              "url('https://wallpapersok.com/images/hd/a-person-standing-on-top-of-a-mountain-looking-at-the-snowy-mountains-3hxo0etey8k7fsgo.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            height: { xs: "60vh", md: "80vh" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          />
          <Container sx={{ position: "relative", zIndex: 1, color: "#fff" }}>
            <Typography variant="h2" gutterBottom>
              TravelMate
            </Typography>
            <Typography variant="h5" gutterBottom>
              Plan smarter. Pack better. Travel easier.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 10 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            textAlign="center"
          >
            How It Works
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            mb={6}
          >
            A simple, guided process to help you plan the perfect trip.
          </Typography>
          <Grid container spacing={5}>
            {steps.map((step, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Link href={step.path} passHref legacyBehavior>
                  <Card
                    component="a"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      textDecoration: "none",
                      borderRadius: 3,
                      border: "1px solid #e0e0e0",
                      overflow: "hidden",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={step.image}
                      alt={step.label}
                      sx={{
                        height: 200,
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Step {idx + 1}
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {step.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h4" gutterBottom>
            Who's It For?
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                title: "Casual Travelers",
                description:
                  "Simple and guided experience. Get packing help tailored for leisure trips.",
              },
              {
                title: "Business Travelers",
                description:
                  "Smart outfit suggestions and quick access to saved trips for frequent flyers.",
              },
            ].map((profile, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card sx={{ boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="h6">{profile.title}</Typography>
                    <Typography>{profile.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h4" gutterBottom>
            Key Features
          </Typography>
          <Grid container spacing={4}>
            {[
              "Weather-based outfit recommendations",
              "Customizable packing lists",
              "Real-time weather updates",
              "Travel tips & cultural insights",
              "Trip history & preferences",
            ].map((feature, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card sx={{ boxShadow: 3 }}>
                  <CardContent>{feature}</CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        <Box
          sx={{
            backgroundColor: "#3cabc9",
            color: "#fff",
            py: 8,
            textAlign: "center",
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
              Ready to plan your next trip?
            </Typography>
            <Link href="/signup" passHref legacyBehavior>
              <Button variant="contained" color="primary">
                Sign Up Now
              </Button>
            </Link>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
