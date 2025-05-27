'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { ProductByHandleQuery, Money } from '@/lib/types';

interface Props {
  product: NonNullable<ProductByHandleQuery['productByHandle']>;
}

export default function ProductPage({ product }: Props) {
  const { title, description, imagesJson, variants } = product;

  // Extract all image URLs from the references
  const urls = imagesJson?.references.nodes
    .filter(n => n.__typename === 'MediaImage')
    .map(n => n.image.url) ?? [];

  const firstUrl = urls[0];
  const priceNode = variants.edges[0]?.node.price as Money | undefined;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      {firstUrl && (
        <Box
          component="img"
          src={firstUrl}
          alt={title}
          sx={{
            maxWidth: 400,
            width: '100%',
            height: 'auto',
            mb: 3,
            display: 'block',
          }}
        />
      )}

      <Typography variant="body1" paragraph>
        {description}
      </Typography>

      {priceNode && (
        <Typography variant="h5" gutterBottom>
          {priceNode.amount} {priceNode.currencyCode}
        </Typography>
      )}

      <Button variant="contained" size="large">
        Add to Cart
      </Button>
    </Box>
  );
}