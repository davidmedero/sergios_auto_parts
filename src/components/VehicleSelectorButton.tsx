"use client";

import { useState } from 'react';
import VehicleSelectorModal from '../components/VehicleSelectorModal';
import { Button, Grid } from '@mui/material';

export default function VehicleSelectorButton() {
  const [open, setOpen] = useState(false);

  return (
    <Grid container sx={{ justifyContent: 'center', alignItems: 'center', m: 'auto', width: '100vw',
      height: '100vh' }}>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Select Your Vehicle
      </Button>

      <VehicleSelectorModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </Grid>
  );
}