'use client'

import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    mode: 'light',
    background: {
      default: '#F5F5F5',  // off-white neutral
      paper:   '#FFFFFF',
    },
    primary: {
      main:        '#1565C0', // Deep Blue
      light:       '#42A5F5',
      dark:        '#0D47A1',
      contrastText:'#FFFFFF',
    },
    secondary: {
      main:        '#546E7A', // Steel Gray
      light:       '#788A99',
      dark:        '#2E3A45',
      contrastText:'#FFFFFF',
    },
    warning: {               // use for your accent/CTA color
      main:        '#FF8F00', // Safety Orange
      light:       '#FFB300',
      dark:        '#FF6F00',
      contrastText:'#000000',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;