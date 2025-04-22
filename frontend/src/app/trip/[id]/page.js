"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import {
  Container,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  Fab,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import DownloadIcon from "@mui/icons-material/Download";

export default function TripDetailsPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const tripRef = doc(db, "users", user.uid, "trips", id);

      try {
        const snapshot = await getDoc(tripRef);
        if (snapshot.exists()) {
          setTrip(snapshot.data());
        } else {
          console.error("Trip not found");
        }
      } catch (err) {
        console.error("Error fetching trip:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleOpenPreview = async () => {
    const element = document.getElementById("trip-content");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    setPreviewImage(imgData);
    setPreviewOpen(true);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("trip-content");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let position = 0;

    // Add botty message
    pdf.setFontSize(14);
    const botMsg = `Hey! I'm planning a trip to ${trip.destination} using TravelMate.`;
    pdf.text(botMsg, 10, 15);
    position += 20;

    if (imgHeight <= pdfHeight - position) {
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    } else {
      let remainingHeight = imgHeight;
      let offset = 0;

      while (remainingHeight > 0) {
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight, "", "FAST", 0, offset);
        remainingHeight -= pdfHeight;
        offset += pdfHeight * (imgProps.width / pdfWidth);
        if (remainingHeight > 0) {
          pdf.addPage();
          position = 0;
        }
      }
    }

    pdf.save("travelmate-trip.pdf");
  };

  if (loading) {
    return (
      <Container sx={{ mt: 6 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container sx={{ mt: 6 }}>
        <Typography color="error">Trip not found.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 6 }}>
      <Box sx={{ textAlign: "right", mb: 2 }}>
        <Button variant="contained" onClick={handleOpenPreview}>
          View Preview
        </Button>
      </Box>

      <div id="trip-content">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {trip.destination}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          {trip.startDate} → {trip.endDate}
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          Activities:{" "}
          {Array.isArray(trip.activities) ? trip.activities.join(", ") : "None"}
        </Typography>

        <Paper sx={{ p: 3, mb: 3, mt: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Packing List
          </Typography>
          <Typography>
            <ReactMarkdown>{trip.packingList}</ReactMarkdown>
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, mb: 3, mt: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Clothing Suggestions
          </Typography>
          <Typography>
            <ReactMarkdown>{trip.clothingSuggestions}</ReactMarkdown>
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Local Essentials
          </Typography>
          <Typography>
            <ReactMarkdown>{trip.localEssentials}</ReactMarkdown>
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Travel Tips
          </Typography>
          <Typography>
            <ReactMarkdown>{trip.travelTips}</ReactMarkdown>
          </Typography>
        </Paper>
      </div>

      {/* PDF Preview Modal */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Trip Preview</DialogTitle>
        <DialogContent>
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

        {/* Floating download FAB in bottom right */}
        <Box sx={{ position: "absolute", bottom: 16, right: 24 }}>
          <Tooltip title="Download">
            <Fab color="primary" onClick={handleDownloadPDF}>
              <DownloadIcon />
            </Fab>
          </Tooltip>
        </Box>
      </Dialog>
    </Container>
  );
}