'use client';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BreadcrumbsNav from './BreadcrumbsNav';
import ProductCard, { Product } from './ProductCard';

interface Props {
  title:    string;
  segments: string[];
  names:    string[];
  list:     Product[];
}

export default function ProductListPage({
  title,
  segments,
  names,
  list,
}: Props) {
  return (
    <Box sx={{ p: 3 }}>
      <BreadcrumbsNav segments={segments} names={names} />

      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      <Grid container spacing={2}>
        {list.map(p => (
          <Grid key={p.id} size={{ xs: 6, sm: 4, md: 3 }}>
            <ProductCard product={p} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}