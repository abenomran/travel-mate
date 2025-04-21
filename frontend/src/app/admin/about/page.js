"use client";
import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  IconButton,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useAdminCheck } from "@/app/hooks/CheckAdmin";

export default function AboutEditPage() {
  // admin check values
  const { loading, isAdmin } = useAdminCheck();

  const [aboutParagraphs, setAboutParagraphs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [editingParagraphs, setEditingParagraphs] = useState(false);
  const [editingFaqIndex, setEditingFaqIndex] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      const ref = doc(db, "siteContent", "aboutPage");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setAboutParagraphs(data.about || []);
        setFaqs(data.faqs || []);
      }
    };

    fetchContent();
  }, []);

  // admin check
  if (loading) {
    return (
      <Container sx={{ mt: 6 }}>
        <CircularProgress />
      </Container>
    );
  }
  if (!isAdmin) return null;

  const handleSaveParagraphs = async () => {
    const ref = doc(db, "siteContent", "aboutPage");
    await setDoc(ref, { about: aboutParagraphs }, { merge: true });
    setEditingParagraphs(false);
  };

  const handleSaveFaq = async (index) => {
    const newFaqs = [...faqs];
    const ref = doc(db, "siteContent", "aboutPage");
    await setDoc(ref, { faqs: newFaqs }, { merge: true });
    setEditingFaqIndex(null);
  };

  return (
    <Container sx={{ mt: 6, mb: 10 }}>
      {/* Editable About Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          About TravelMate
          <IconButton onClick={() => setEditingParagraphs(!editingParagraphs)}>
            {editingParagraphs ? <SaveIcon /> : <EditIcon />}
          </IconButton>
        </Typography>
        <Stack spacing={2}>
          {aboutParagraphs.map((para, i) =>
            editingParagraphs ? (
              <TextField
                key={i}
                fullWidth
                multiline
                value={para}
                onChange={(e) => {
                  const updated = [...aboutParagraphs];
                  updated[i] = e.target.value;
                  setAboutParagraphs(updated);
                }}
              />
            ) : (
              <Typography variant="body1" key={i}>
                {para}
              </Typography>
            )
          )}
        </Stack>
        {editingParagraphs && (
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleSaveParagraphs}
          >
            Save Paragraphs
          </Button>
        )}
      </Box>

      {/* Editable FAQ Section */}
      <Typography variant="h4" gutterBottom>
        FAQs
      </Typography>
      {faqs.map((faq, i) => (
        <Accordion key={i}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              {editingFaqIndex === i ? (
                <TextField
                  fullWidth
                  variant="standard"
                  value={faq.question}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[i].question = e.target.value;
                    setFaqs(updated);
                  }}
                />
              ) : (
                <Typography sx={{ fontWeight: 500 }}>{faq.question}</Typography>
              )}

              <IconButton
                onClick={() => {
                  if (editingFaqIndex === i) {
                    handleSaveFaq(i);
                  } else {
                    setEditingFaqIndex(i);
                  }
                }}
              >
                {editingFaqIndex === i ? <SaveIcon /> : <EditIcon />}
              </IconButton>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {editingFaqIndex === i ? (
              <TextField
                fullWidth
                multiline
                value={faq.answer}
                onChange={(e) => {
                  const updated = [...faqs];
                  updated[i].answer = e.target.value;
                  setFaqs(updated);
                }}
              />
            ) : (
              <Typography>{faq.answer}</Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
}
