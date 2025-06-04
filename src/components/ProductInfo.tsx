'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState, type FC } from 'react';
import { Divider, Grid } from '@mui/material';
import NumberFieldForProductInfoPage from "./NumberField";
import { useCart } from "@/contexts/CartContext";
import { useVehicles } from '@/contexts/VehiclesContext';
import VehicleSelectorModal from './VehicleSelectorModal';
import { FaCar } from 'react-icons/fa';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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
  const { vehicles, currentVehicleId } = useVehicles();
  
  // See if there’s a “current” vehicle selected in context:
  const current = vehicles.find((v) => v.id === currentVehicleId) ?? null;

  const [quantity, setQuantity] = useState<number>(1);
  const [modalOpen, setModalOpen] = useState(false);

  const handleChange = (value: number | null) => {
    if (value === null || value < 1 || value > 10) return;
    setQuantity(value);
  };

  const addToCart = async () => {
    await addLine(id, quantity);
  };

  const openVehicleModal = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // Prevent the Card’s Link from firing:
    e.stopPropagation();
    e.preventDefault();

    setModalOpen(true);
  };
  
  return (
    <>
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
        {/* “Fits a <vehicle>” section (clicking here opens the modal) */}
        {current ? (
          <Grid
            onClick={openVehicleModal}
            container
            sx={{
              mt: 1,
              py: 1,
              px: 2,
              bgcolor: "rgb(243, 248, 243)",
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexWrap: "nowrap",
              borderBottom: '2px solid rgb(30, 116, 0)'
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
                sx={{ position: "relative", mr: 2, flexShrink: 0, top: 5 }}
              >
                <FaCar
                  size="1.3rem"
                  color="#2d2a26"
                  style={{ width: "30px" }}
                />
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
              <Typography
                component="span"
                color="#157400"
                fontSize={14}
                sx={{ pr: "5px" }}
              >
                Fits a
              </Typography>
              <Typography
                component="span"
                fontSize={14}
                sx={{ textDecoration: "underline" }}
              >
                {current.label}
              </Typography>
            </Box>
          </Grid>
        ) : null}
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

      {/* Vehicle Selector Modal */}
      <VehicleSelectorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default ProductInfo;