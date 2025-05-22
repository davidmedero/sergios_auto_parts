'use client'

import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        textAlign: 'center',
        borderTop: theme => `1px solid ${theme.palette.divider}`,
        mt: 'auto'
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} Sergios Auto Parts. All rights reserved.
      </Typography>
    </Box>
  );
}