import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#A0735F', // Warm terracotta
      dark: '#7F5A4B',
      light: '#C59982',
      contrastText: '#fff',
    },
    secondary: {
      main: '#D4A574', // Golden accent
      contrastText: '#3E3B36',
    },
    background: {
      default: '#FAFAF9', // Off-white background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#5C5953', // Body text
      secondary: '#9B9891', // Muted text
      heading: '#3E3B36', // Headings
    },
    success: {
      main: '#6B9F77',
    },
    error: {
      main: '#C85B5B',
    },
  },
  typography: {
    fontFamily: [
      '"Open Sans"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 700,
      color: '#3E3B36',
    },
    h2: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 600,
      color: '#3E3B36',
    },
    h3: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 600,
      color: '#3E3B36',
    },
    h4: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 600,
      color: '#3E3B36',
    },
    h5: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 600,
      color: '#3E3B36',
    },
    h6: {
      fontFamily: '"Playfair Display", Georgia, serif',
      fontWeight: 600,
      color: '#3E3B36',
    },
    button: {
      fontFamily: '"Open Sans", sans-serif',
      textTransform: 'none', // Material Design 3 prefers sentence case mostly, but keeping 'none' is cleaner
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50, // Pill shape for buttons
          padding: '10px 24px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #A0735F 0%, #7F5A4B 100%)',
          boxShadow: '0 4px 6px -1px rgba(26, 24, 22, 0.08)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7F5A4B 0%, #A0735F 100%)',
            boxShadow: '0 10px 15px -3px rgba(26, 24, 22, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(26, 24, 22, 0.08)',
        },
      },
    },
  },
});

export default theme;
