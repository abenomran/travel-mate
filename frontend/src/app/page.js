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

export default function Home() {
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
        <Link href="/signup" passHref>
          <Button variant="contained" sx={{ mt: 3 }}>
            Get Started
          </Button>
        </Link>
      </Container>

      {/* How It Works */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          How It Works
        </Typography>
        <Grid container spacing={4}>
          {[
            "Enter Destination",
            "Get Weather Forecast",
            "Receive Packing List",
          ].map((step, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    Step {idx + 1}
                  </Typography>
                  <Typography>{step}</Typography>
                </CardContent>
              </Card>
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
        <Link href="/signup" passHref>
          <Button variant="contained" size="large" sx={{ mt: 3 }}>
            Sign Up Now
          </Button>
        </Link>
      </Container>
    </Box>
  );
}
