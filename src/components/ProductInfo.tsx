'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { FC } from 'react';
import type { Money } from '@/lib/types';

interface Props {
  title:       string;
  description: string;
  price?:      Money;
}

const ProductInfo: FC<Props> = ({ title, description, price }) => {
  return (
    <Box
      sx={{
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 3,
        maxWidth: 600
      }}
    >
      <Typography variant="h4">{title}</Typography>
      <Typography variant="body1">{description}</Typography>
      {price && (
        <Typography variant="h5">
          {price.amount} {price.currencyCode}
        </Typography>
      )}
      <Button variant="contained" size="large">
        Add to Cart
      </Button>
    </Box>
  );
};

export default ProductInfo;