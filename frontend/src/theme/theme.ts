import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1f6f78",
    },
    secondary: {
      main: "#f08a24",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
    h4: {
      fontWeight: 700,
      letterSpacing: -0.5,
    },
    h5: {
      fontWeight: 700,
      letterSpacing: -0.3,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
});
