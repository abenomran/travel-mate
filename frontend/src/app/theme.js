import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0D47A1", // Dark blue (navbar)
    },
    secondary: {
      main: "#29B6F6", // Light blue (nav buttons)
      dark: "#0288D1", // Hover color
    },
    background: {
      default: "#f5f5f5",
    },
  },
});

export default theme;
