"use client";

import React, { useState } from 'react';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
} from '@mui/material';
import VehicleSelectorModal from '../components/VehicleSelectorModal';

// Sample category data
const categories = [
  { title: 'Brakes', img: '/images/brakes.jpg' },
  { title: 'Oil & Fluids', img: '/images/oil_fluids.jpg' },
  { title: 'Filters', img: '/images/filters.jpg' },
  { title: 'Batteries', img: '/images/batteries.jpg' },
];

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Hero Section */}
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Find the Right Part for Your Car
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Enter your vehicle details to see compatible parts instantly.
        </Typography>
      </Container>

      {/* Category Cards */}
      <Container sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Shop by Category
        </Typography>
        <Grid container spacing={4}>
          {categories.map((cat) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={cat.title}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={cat.img}
                  alt={cat.title}
                />
                <CardContent>
                  <Typography variant="h6" component="div">
                    {cat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Vehicle Selector Modal */}
      <VehicleSelectorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}