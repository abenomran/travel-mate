"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import ReactMarkdown from "react-markdown";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";

export default function PackingListPage() {
  const searchParams = useSearchParams();
  const destination = searchParams.get("destination");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const activities = searchParams.get("activities")?.split(",") || [];
  const reminderDate = searchParams.get("reminderDate");

  const [packingList, setPackingList] = useState("");
  const [travelTips, setTravelTips] = useState("");
  const [localEssentials, setLocalEssentials] = useState("");
  const [clothingSuggestions, setClothingSuggestions] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [shareOpen, setShareOpen] = useState(false);
  const [botMessage, setBotMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchPackingData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/packing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination,
            startDate: start,
            endDate: end,
            activities,
          }),
        });

        const data = await response.json();

        setPackingList(data.packingList || "No packing list returned.");
        setTravelTips(data.travelTips || "No travel tips available.");
        setLocalEssentials(data.localEssentials || "No local essentials listed.");
        setClothingSuggestions(data.clothingSuggestions || "No clothing suggestions provided.");
        setError("");
      } catch (err) {
        console.error("Packing list error:", err);
        setError("Failed to generate packing information. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (!hasFetched.current && destination && start && end && activities.length > 0) {
      hasFetched.current = true;
      fetchPackingData();
    }
  }, [destination, start, end, activities]);

  useEffect(() => {
    if (destination) {
      setBotMessage(
        `Hey! I'm planning a trip to ${destination} using TravelMate. Here's my packing list: travelmate.com`
      );
    }
  }, [destination]);

  const handleOpenShare = async () => {
    const element = document.getElementById("pdf-content");
    const canvas = await html2canvas(element, { scale: 2 }); // High quality
    const imgData = canvas.toDataURL("image/png");
    setPreviewImage(imgData);
    setShareOpen(true);
  };

  const handleCloseShare = () => {
    setShareOpen(false);
    setPreviewImage(null);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(botMessage);
    } catch (err) {
      console.error("Error copying message:", err);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("pdf-content");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save("travelmate-trip.pdf");
  };

  return (
    <Box sx={{ backgroundColor: "#F9FAFB", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="md">

        <Button variant="contained" color="primary" sx={{ mb: 3 }} onClick={handleOpenShare}>
          Share Your Trip
        </Button>

        <div id="pdf-content">
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Your Smart Packing List
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            For your trip to <strong>{destination}</strong> from{" "}
            <strong>{start}</strong> to <strong>{end}</strong>
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Activities: {activities.join(", ") || "None selected"}
          </Typography>

          {reminderDate && (
            <Typography variant="subtitle2" gutterBottom sx={{ color: "green" }}>
              Reminder Set For: <strong>{reminderDate}</strong>
            </Typography>
          )}

          {loading ? (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Generating your list...</Typography>
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ mt: 4 }}>
              {error}
            </Typography>
          ) : (
            <>
              <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Packing List
                </Typography>
                <ReactMarkdown>{packingList}</ReactMarkdown>
              </Paper>

              <Divider sx={{ my: 4 }} />

              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Clothing Suggestions
                </Typography>
                <ReactMarkdown>{clothingSuggestions}</ReactMarkdown>
              </Paper>

              <Divider sx={{ my: 4 }} />

              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Local Essentials
                </Typography>
                <ReactMarkdown>{localEssentials}</ReactMarkdown>
              </Paper>

              <Divider sx={{ my: 4 }} />

              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Travel Tips
                </Typography>
                <ReactMarkdown>{travelTips}</ReactMarkdown>
              </Paper>
            </>
          )}
        </div>
      </Container>

      {/* Share Modal */}
      <Dialog open={shareOpen} onClose={handleCloseShare} fullWidth maxWidth="md">
        <DialogTitle>Share Your Trip</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {botMessage}
          </Typography>

          {previewImage && (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <img
                src={previewImage}
                alt="Trip Preview"
                style={{ maxWidth: "100%", borderRadius: "8px" }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ display: "flex", justifyContent: "space-between", px: 3, pb: 2 }}>
          <IconButton onClick={handleCopyMessage}>
            <ContentCopyIcon />
          </IconButton>
          <IconButton onClick={handleDownloadPDF}>
            <DownloadIcon />
          </IconButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}