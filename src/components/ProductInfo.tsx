'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { FC } from 'react';
import type { Money } from '@/lib/types';
import { Divider } from '@mui/material';

interface Props {
  title:       string;
  price?:      Money;
  sku: string;
  partNumber: { value: string };
}

const ProductInfo: FC<Props> = ({ title, price, sku, partNumber }) => {
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
      <Typography variant="h4" fontSize="20px" fontWeight="600">{title}</Typography>
      {/* Part # and SKU */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: '#6E6E6E',
          typography: 'body2',
          gap: 1
        }}
      >
        <Typography component="span" fontSize='12px'>Part #</Typography>
        <Typography component="span" fontSize='12px' sx={{ color: "#2d2a26" }}>{partNumber?.value}</Typography>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ bgcolor: '#A9AAA8', height: 18, mx: 1 }}
        />
        <Typography component="span" fontSize='12px'>SKU #</Typography>
        <Typography component="span" fontSize='12px' sx={{ color: "#2d2a26" }}>{sku}</Typography>
      </Box>
      {price && (
        <Typography variant="h5">
          ${price.amount}
        </Typography>
      )}
      <Button variant="contained" size="large">
        Add to Cart
      </Button>
    </Box>
  );
};

export default ProductInfo;