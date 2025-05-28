import React from 'react';
import {
  SwipeableDrawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CartProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

// Dummy cart items
const cartItems = [
  { id: 1, name: 'Brake Pad Set', qty: 2, price: 49.99 },
  { id: 2, name: 'Oil Filter', qty: 1, price: 9.49 },
  { id: 3, name: 'Spark Plug x4', qty: 1, price: 15.99 },
];

export default function Cart({ open, onOpen, onClose }: CartProps) {
  // detect iOS for swipe behavior
  const iOS =
    typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const total = cartItems
    .reduce((sum, item) => sum + item.price * item.qty, 0)
    .toFixed(2);

  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      swipeAreaWidth={0}
    >
      <Box sx={{ width: 376, minHeight: "100dvh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Header */}
        <Box>
          <Box sx={{ position: 'relative', px: 2, py: "10px" }}>
            <Typography variant="h6">Your Cart</Typography>
            <IconButton
              edge="end"
              onClick={onClose}
              aria-label="close"
              sx={{ position: 'absolute', right: 18, top: 6 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          {/* Cart items */}
          <List disablePadding>
            {cartItems.map((item) => (
              <ListItem key={item.id} sx={{ py: 1 }}>
                <ListItemText
                  primary={`${item.name} x${item.qty}`}
                  secondary={`$${(item.price * item.qty).toFixed(2)}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Total & Checkout */}
        <Box sx={{ my: 2 }}>
          <Divider />
          <Box sx={{ mt: 2, px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">Total:</Typography>
            <Typography variant="h6">${total}</Typography>
          </Box>

          <Box sx={{ mx: 2, mt: 2  }}>
            <Button variant="contained" color="primary" fullWidth>
              Checkout
            </Button>
          </Box>
        </Box>
        
      </Box>
    </SwipeableDrawer>
  );
}