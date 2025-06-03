'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState, type FC } from 'react';
import { Divider, Grid } from '@mui/material';
import NumberFieldForProductInfoPage from "./NumberField";
import { useCart } from "@/contexts/CartContext";

interface Props {
  id: string;
  title: string;
  handle: string;
  image: string;
  price: string;
  sku: string;
  partNumber: { value: string };
}

const ProductInfo: FC<Props> = ({ id, title, price, sku, partNumber }) => {
  const { addLine, setCartOpen } = useCart();

  const [quantity, setQuantity] = useState<number>(1);

  const handleChange = (value: number | null) => {
    if (value === null || value < 1 || value > 10) return;
    setQuantity(value);
  };

  const addToCart = async () => {
    await addLine(id, quantity);
  };
  
  return (
    <Grid
      container
      sx={{
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pt: 3,
        maxWidth: 664,
        px: 3,
        width: '100%',
        '@media (max-width: 664px)': {
          flex: 'unset',
          maxWidth: '100%',
          px: 2,
          mt: 0.5
        }
      }}
    >
      <Typography variant="h4" fontSize="20px" fontWeight="600" sx={{ color: "#2d2a26" }}>{title}</Typography>
      {/* Part # and SKU */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: '#6E6E6E',
          typography: 'body2',
          gap: 1,
        }}
      >
        <Typography component="span" fontSize='12px'>Part #</Typography>
        <Typography component="span" fontSize='12px' sx={{ color: "#2d2a26" }}>{partNumber.value}</Typography>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ bgcolor: '#A9AAA8', height: 18, mx: 1 }}
        />
        <Typography component="span" fontSize='12px'>SKU #</Typography>
        <Typography component="span" fontSize='12px' sx={{ color: "#2d2a26" }}>{sku}</Typography>
      </Box>
      {price && (
        <Typography variant="h5" sx={{ color: "#2d2a26" }}>
          ${price}
        </Typography>
      )}
      <NumberFieldForProductInfoPage value={quantity} handleChange={handleChange} />
      <Button 
        onClick={() => {
          addToCart();
          setCartOpen({ right: true });
        }}
        variant="contained" 
        size="large"
        sx={{ 
          mt: 1,
          bgcolor: "#2d2a26",
          color: '#fff',
          '&:hover': {
            bgcolor: "grey.800",
          }
        }}
      >
        Add to Cart
      </Button>
    </Grid>
  );
};

export default ProductInfo;