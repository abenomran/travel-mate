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
  Paper,
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
        setFaqList(data.faqs || []);
        setAboutParagraphs(data.about || []);
      }
    };

    fetchAboutContent();
  }, []);

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgba(216,243,250,0.8) 0%, rgba(219,242,255,0.8) 100%)',
        minHeight: '100vh',
        py: 8,
      }}
    >
      <Container maxWidth="md">
        {/* About Section */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 6,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              textAlign: 'center',
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}
          >
            About TravelMate
          </Typography>

          {aboutParagraphs.map((para, i) => (
            <Typography
              variant="body1"
              key={i}
              sx={{
                mb: i < aboutParagraphs.length - 1 ? 2 : 0,
                lineHeight: 1.7,
                color: 'text.primary',
              }}
            >
              {para}
            </Typography>
          ))}
        </Paper>

        <Divider sx={{ mb: 4 }} />

        {/* FAQ Section */}
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            mb: 4,
            letterSpacing: '0.5px',
          }}
        >
          Frequently Asked Questions
        </Typography>

        <Box>
          {faqList.map((faq, i) => (
            <Accordion
              key={i}
              elevation={1}
              sx={{ mb: 2, borderRadius: 2, '& .MuiAccordion-root:before': { display: 'none' } }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
              >
                <Typography sx={{ fontWeight: 500, letterSpacing: '0.3px' }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'rgba(250,250,250,0.9)' }}>
                <Typography sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
}