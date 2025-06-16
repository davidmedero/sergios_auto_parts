'use client'

import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import HeroSlider from './HeroSlider';

export default function Hero() {

  const heroes = [
    'ez-parts-hero-1.webp',
    'ez-parts-hero-2.jpeg',
    'ez-parts-hero-3.jpeg',
    'ez-parts-hero-4.webp',
    'ez-parts-hero-5.jpeg'
  ]

  const slides = heroes.map(
    name => `https://ez-parts-media.s3.amazonaws.com/hero-images/${name}`
  )

  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Box sx={{ boxShadow: '0 3px 6px rgba(0, 0, 0, 0.3)', position: 'relative' }}>
      <HeroSlider windowSize={windowSize}>
        {slides.map((src, index) => (
          <Box
            key={index}
            component='img'
            alt={`hero_image-${index}`}
            src={src}
            sx={{
              position: 'absolute',
              left: 0,
              maxWidth: '1560px',
              width: '100dvw',
              margin: '0 auto',
              userSelect: 'none',
              objectFit: 'contain',
              cursor: 'grab',
              '&:active': {
                cursor: 'grabbing'
              },
              "@media (max-width: 1024px)": {
                minHeight: '40dvw',
                objectFit: 'cover'
              },
              "@media (max-width: 768px)": {
                minHeight: '50dvw',
              },
            }}
            draggable="false"
            loading="lazy"
          />
        ))}
      </HeroSlider>
    </Box>
  );
};