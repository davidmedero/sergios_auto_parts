"use client";

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import { Money } from "@/lib/types";
import { Divider, Grid } from "@mui/material";
import { useVehicles } from "@/contexts/VehiclesContext";
import { FaCar } from "react-icons/fa";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VehicleSelectorModal from "./VehicleSelectorModal";
import { useState } from "react";

export interface Product {
  id:       string;
  handle:   string;
  title:    string;
  imageUrl: string;
  altText:  string;
  price:    Money;
  partNumber: string;
  sku: string;
  notes: string;
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const formattedPrice = parseFloat(product.price.amount).toFixed(2);

  const { vehicles, currentVehicleId } = useVehicles();
  
  // Currently shopping
  const current = vehicles.find(v => v.id === currentVehicleId) ?? null;

  return (
    <>
    <Card
      sx={{
        display: "flex",
        boxShadow: 1,
        borderRadius: 1,
        overflow: "hidden",
        py: 2,
        pl: 2
      }}
    >
      {/* ─────────── Left: Image Thumbnail ─────────── */}
      <Link href={`/${product.handle}`} style={{ textDecoration: "none" }}>
        <CardMedia
          component="img"
          image={product.imageUrl}
          alt={product.altText}
          sx={{
            width: 140,
            height: 140,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      </Link>

      <Grid container sx={{ width: '100%', flexGrow: 1 }}>
        {/* ─────────── Center: Product Details ─────────── */}
        <Box
          sx={{
            flexGrow: 1,
            px: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: '280px'
          }}
        >
          {/* 1) Title (clickable) */}
          <Link
            href={`/${product.handle}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Typography variant="subtitle1" fontSize={18} fontWeight={500}>
              {product.title}
            </Typography>
          </Link>

          {/* ── Placeholder for additional details you may add later ── */}
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
          <Typography component="span" fontSize='12px' sx={{ color: "#2d2a26" }}>{product.partNumber}</Typography>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ bgcolor: '#A9AAA8', height: 18, mx: 1 }}
          />
          <Typography component="span" fontSize='12px'>SKU #</Typography>
          <Typography component="span" fontSize='12px' sx={{ color: "#2d2a26" }}>{product.sku}</Typography>
        </Box>
        {
          current ? (
            <Grid
              onClick={() => setModalOpen(true)}
              container
              sx={{
                mt: 1,
                py: 1,
                px: 2,
                bgcolor: "rgb(243, 248, 243)",
                borderRadius: 0.5,
                width: '100%',
                flexGrow: 1,
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexWrap: 'nowrap'
              }}
            >
              <Box
                sx={{
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  textAlign: "left",
                  bgcolor: "transparent",
                }}
              >
                <Box 
                  sx={{ 
                    position: "relative",
                    mr: 2,
                    flexShrink: 0,
                    top: 5
                  }}
                >
                  <FaCar size="1.3rem" color="#2d2a26" style={{ width: "30px" }} />
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

              </Box>
              <Box>
                <Typography component='span' color="#157400" fontSize={14} sx={{ pr: '5px' }}>
                  Fits a
                </Typography>
                <Typography component='span' fontSize={14} sx={{ textDecoration: 'underline' }}>
                  {current.label}
                </Typography>
              </Box>
            </Grid>
          ) : null
        }
          {/* <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: "block" }}
          >
            Amperage Rating: 80A
          </Typography> */}
          <Typography
            variant="body2"
            fontSize={12}
            sx={{ mt: 1, color: "#2d2a26" }}
          >
            <span style={{ fontWeight: 600 }}>Notes: </span>{product.notes}
          </Typography>
        
        </Box>

        {/* ─────────── Right: Price + “Add to Cart” Button ─────────── */}
        <Box
          sx={{
            px: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-end",
            '@media (max-width: 680px)': {
              width: '100%',
              alignItems: "flex-start",
              mt: 2
            }
          }}
        >
          {/* 1) Price */}
          <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
            ${formattedPrice}
          </Typography>

          {/* 3) “Add to Cart” button */}
          <Button 
            variant="contained" 
            size="small" 
            sx={{ 
              width: '130px', 
              py: 1, 
              bgcolor: "#2d2a26",
              color: '#fff',
              '&:hover': {
                bgcolor: "grey.800",
              },
              '@media (max-width: 680px)': {
                width: '100%',
                mt: 2
              }
            }}
          >
            Add to Cart
          </Button>
        </Box>
      </Grid>
      
    </Card>
    {/* Vehicle Selector Modal */}
      <VehicleSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}