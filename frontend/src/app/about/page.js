"use client";
import * as React from "react";
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqs = [
  {
    question: "What is TravelMate?",
    answer:
      "TravelMate is a web application that helps users plan their trips by offering weather-based outfit suggestions, packing lists, and essential travel tips based on destination, travel dates, and planned activities.",
  },
  {
    question: "How do I create an account?",
    answer:
      "You can register for a TravelMate account to save your trips and access them later. Registration is required to store personalized travel plans.",
  },
  {
    question: "Can I log in and view my saved trips?",
    answer:
      "Yes. Once logged in, you’ll be able to view your previously saved trips from your account.",
  },
  {
    question: "How do I create a trip?",
    answer:
      "To create a trip, enter your destination, travel dates, and planned activities. TravelMate will generate outfit and packing recommendations accordingly.",
  },
  {
    question: "How does TravelMate know what I need to pack?",
    answer:
      "TravelMate uses your destination, dates, and selected activities to generate a customized packing list. It also integrates with weather prediction to ensure your list is weather-appropriate.",
  },
  {
    question: "What if the weather changes during my trip?",
    answer:
      "TravelMate provides real-time weather updates throughout your trip duration to help you stay prepared and adjust your packing list if needed.",
  },
  {
    question: "Can I add or remove items from my packing list?",
    answer:
      "Yes. You can fully customize your packing list by adding or removing items to suit your preferences.",
  },
  {
    question: "What features are available for frequent business travelers?",
    answer:
      "Business travelers can receive professional outfit recommendations and duplicate previous trips for efficiency.",
  },
  {
    question: "What kind of travel tips does TravelMate provide?",
    answer:
      "TravelMate includes destination-specific cultural dress guidelines, currency details, emergency contacts, and key travel phrases.",
  },
];

export default function About() {
  return (
    <Container sx={{ mt: 6, mb: 10 }}>
      {/* About Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          About TravelMate
        </Typography>
        <Typography variant="body1" paragraph>
          TravelMate is a web application designed to simplify your travel
          planning experience. Whether you're a casual vacationer or a frequent
          business traveler, TravelMate helps you pack smart, stay
          weather-prepared, and travel with confidence.
        </Typography>
        <Typography variant="body1" paragraph>
          By integrating real-time weather data and location-based insights,
          TravelMate generates personalized packing lists, outfit suggestions,
          and cultural travel tips based on your destination, dates, and planned
          activities.
        </Typography>
        <Typography variant="body1" paragraph>
          With the ability to save, manage, and duplicate trips, you’ll always
          be ready for your next adventure — whether it’s a quick business trip
          or a family getaway.
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* FAQ Section */}
      <Typography variant="h4" gutterBottom>
        Frequently Asked Questions
      </Typography>
      {faqs.map((faq, index) => (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 500 }}>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
}
