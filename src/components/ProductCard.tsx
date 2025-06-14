'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Divider, Grid } from '@mui/material';
import { FaCar } from 'react-icons/fa';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { Money } from '@/lib/types';
import { useVehicles } from '@/contexts/VehiclesContext';
import { useCart } from '@/contexts/CartContext';
import VehicleSelectorModal from './VehicleSelectorModal';

export interface Product {
  id:          string;
  handle:      string;
  title:       string;
  imageUrl:    string;
  altText:     string;
  price:       Money;
  partNumber:  string;
  sku:         string;
  notes:       string;
  variantId:   string;
  brand:       string;
  createdAt:   string;
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const formattedPrice = parseFloat(product.price.amount).toFixed(2);

  const { vehicles, currentVehicleId } = useVehicles();
  const { addLine, setCartOpen } = useCart();
  const router = useRouter();

  // current vehicle
  const current = vehicles.find(v => v.id === currentVehicleId) ?? null;

  // Add to cart handler
  const addToCart = useCallback(async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    setCartOpen({ right: true });
    await addLine(product.variantId, 1);
  }, [addLine, product.variantId, setCartOpen]);

  // Open vehicle modal
  const openVehicleModal = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    setModalOpen(true);
  }, []);

  // Prefetch on hover
  const handleMouseEnter = useCallback(() => {
    router.prefetch(`/${product.handle}`);
  }, [product.handle, router]);

  return (
    <>
      <Link href={`/${product.handle}`} prefetch onMouseEnter={handleMouseEnter} style={{ textDecoration: 'none' }}>
        <Card
          sx={{
            display: "flex",
            boxShadow: 1,
            borderRadius: 1,
            overflow: "hidden",
            py: 2,
            pl: 2,
            "&:hover": { boxShadow: 3 },
            '@media (max-width: 600px)': {
              flexDirection: 'column',
              gap: 2,
              pl: 0
            }
          }}
        >
          {/* Image */}
          <CardMedia
            component="img"
            image={product.imageUrl}
            alt={product.altText}
            sx={{
              width: 180,
              height: 180,
              objectFit: "cover",
              flexShrink: 0,
              '@media (max-width: 600px)': { mx: 'auto' }
            }}
          />

          <Grid container sx={{ width: "100%", flexGrow: 1 }}>
            {/* Details */}
            <Box sx={{ flexGrow: 1, px: 2, display: "flex", flexDirection: "column", justifyContent: "flex-start", width: 310, gap: 1 }}>
              <Typography fontSize={18} fontWeight={500}>
                {product.title}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", color: "#6E6E6E", typography: "body2", gap: 1 }}>
                <Typography component="span" fontSize="12px">Part #</Typography>
                <Typography component="span" fontSize="12px" sx={{ color: "#2d2a26" }}>{product.partNumber}</Typography>
                <Divider orientation="vertical" flexItem sx={{ bgcolor: "#A9AAA8", height: 18, mx: 1 }}/>
                <Typography component="span" fontSize="12px">SKU #</Typography>
                <Typography component="span" fontSize="12px" sx={{ color: "#2d2a26" }}>{product.sku}</Typography>
              </Box>

              {current && (
                <Grid
                  onClick={openVehicleModal}
                  container
                  sx={{
                    mt: 1, py: 1, px: 2,
                    bgcolor: "rgb(243, 248, 243)",
                    borderTopLeftRadius: 1,
                    borderTopRightRadius: 1,
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    borderBottom: '2px solid rgb(30, 116, 0)'
                  }}
                >
                  <Box sx={{ position: "relative", mr: 2, flexShrink: 0, top: 5 }}>
                    <FaCar size="1.3rem" color="#2d2a26" style={{ width: 30 }}/>
                    <CheckCircleIcon
                      sx={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        bgcolor: "background.paper",
                        borderRadius: "50%",
                        color: "success.main",
                        fontSize: "1rem",
                      }}
                    />
                  </Box>
                  <Typography component="span" color="#157400" fontSize={14} sx={{ pr: "5px" }}>
                    Fits a
                  </Typography>
                  <Typography component="span" fontSize={14} sx={{ textDecoration: "underline" }}>
                    {current.label}
                  </Typography>
                </Grid>
              )}

              <Typography variant="body2" fontSize={12} sx={{ mt: 1, color: "#2d2a26" }}>
                <strong>Notes:</strong> {product.notes}
              </Typography>
            </Box>

            {/* Price & Cart */}
            <Box sx={{
              px: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-end",
              "@media (max-width: 986px)": {
                width: "100%",
                alignItems: "flex-start",
                mt: 2,
              },
            }}>
              <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
                ${formattedPrice}
              </Typography>
              <Button onClick={addToCart} variant="contained" size="small" sx={{
                width: 130, py: 1, bgcolor: "#2d2a26", color: "#fff",
                "&:hover": { bgcolor: "grey.800" },
                "@media (max-width: 986px)": {
                  width: "100%",
                  mt: 2,
                },
              }}>
                Add to Cart
              </Button>
            </Box>
          </Grid>
        </Card>
      </Link>

      <VehicleSelectorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}