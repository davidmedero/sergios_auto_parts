'use client';

import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Money } from '@/lib/types';
import Link from 'next/link';

export interface Product {
  id:       string;
  handle:   string;
  title:    string;
  imageUrl: string;
  altText:  string;
  price:    Money;
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  return (
    <Card sx={{ maxWidth: 240 }}>
      <Link href={`/${product.handle}`}>
        <CardMedia
          component="img"
          height="140"
          image={product.imageUrl}
          alt={product.altText}
        />
      </Link>
      <CardContent>
        <Typography variant="subtitle1" noWrap>
          {product.title}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Typography variant="body2">
          {product.price.amount} {product.price.currencyCode}
        </Typography>
        <Button size="small" variant="contained">
          Add
        </Button>
      </CardActions>
    </Card>
  );
}