'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
} from '@mui/material';
import Hero from '@/components/Hero';
import FadeInSection from '@/hooks/FadeInSection';
import VehicleSelectorModal from '@/components/VehicleSelectorModal';
import type { CatNode } from '@/lib/categories';

interface Props {
  categories: CatNode[];
}

export default function HomeClient({ categories }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <FadeInSection>
        <Hero />
        <Container sx={{ textAlign: 'center', mt: 4 }}>
          <Button variant="contained" onClick={() => setModalOpen(true)}>
            Select Your Vehicle
          </Button>
        </Container>
      </FadeInSection>

      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Find the Right Part for Your Car
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Enter your vehicle details to see compatible parts instantly.
        </Typography>
      </Container>

      <Container sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Shop by Category
        </Typography>
        <Grid container spacing={4}>
          {categories.map((cat) => (
            <Grid key={cat.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <Link
                href={`/${cat.handle}`}
                prefetch={true}
                style={{ textDecoration: 'none' }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': { boxShadow: 4 },
                    cursor: 'pointer'
                  }}
                >
                  {cat.imageUrl && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={cat.imageUrl}
                      alt={cat.imageAlt ?? cat.name}
                      sx={{  
                        objectFit: "contain",
                        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          transform: "scale(1.2)"
                        }
                      }}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" align="center">
                      {cat.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>

      <VehicleSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}