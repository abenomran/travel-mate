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
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function About() {
  const [faqList, setFaqList] = useState([]);
  const [aboutParagraphs, setAboutParagraphs] = useState([]);

  useEffect(() => {
    const fetchAboutContent = async () => {
      const docRef = doc(db, "siteContent", "aboutPage");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFaqList(data.faqs);
        setAboutParagraphs(data.about);
      }
    };

    fetchAboutContent();
  }, []);

  // if (!aboutData) return <div>Loading...</div>;

  return (
    <Container sx={{ mt: 6, mb: 10 }}>
      {/* About Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          About TravelMate
        </Typography>
        {aboutParagraphs.map((para, i) => (
          <Typography
            variant="body1"
            key={i}
            sx={{ mb: i === aboutParagraphs.length - 1 ? 0 : 2 }} // to not put space after last paragraph
          >
            {para}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* FAQ Section */}
      <Typography variant="h4" gutterBottom>
        Frequently Asked Questions
      </Typography>
      {faqList.map((faq, i) => (
        <Accordion key={i}>
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
