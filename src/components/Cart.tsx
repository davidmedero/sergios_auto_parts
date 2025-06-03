"use client";

import React, { useEffect, useState } from "react";
import {
  SwipeableDrawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  DialogContent,
  Slide,
  Fade,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { ArrowRightAlt } from "@mui/icons-material";
import NumberFieldForProductInfoPage from "./NumberField";
import { useCart } from "@/contexts/CartContext";
import DeleteIcon from '@mui/icons-material/Delete';

export default function Cart() {
  const { lines, removeLine, updateLine, cartOpen, setCartOpen, checkoutUrl } = useCart();

  // Local‐only state for the “remove” animation:
  const [removedItems, setRemovedItems] = useState<Record<string, boolean>>({});

  // Whenever `lines` change, ensure any new lines are marked “visible”:
  useEffect(() => {
    const updated = { ...removedItems };
    lines.forEach((ln) => {
      if (!(ln.id in updated)) {
        updated[ln.id] = true;
      }
    });
    setRemovedItems(updated);
  }, [lines]);

  const handleRemoveLine = (lineId: string) => {
    setRemovedItems((prev) => ({ ...prev, [lineId]: false }));
    setTimeout(() => {
      removeLine(lineId);
      setRemovedItems((prev) => {
        const next = { ...prev };
        delete next[lineId];
        return next;
      });
    }, 300);
  };

  // Because the Context now updates lines optimistically, we just render line.quantity:
  const handleQuantityChange = (lineId: string, newQty: number | null) => {
    if (!newQty || newQty < 1) return;
    updateLine(lineId, newQty);
  };

  let cartTotal = 0;
  lines.forEach((line) => {
    const priceNum = parseFloat(line.merchandise.price.amount);
    cartTotal += priceNum * line.quantity;
  });


  return (
    <SwipeableDrawer
      anchor="right"
      open={cartOpen.right}
      onClose={() => setCartOpen({ right: false })}
      onOpen={() => setCartOpen({ right: true })}
      swipeAreaWidth={0}
    >
      <Box
        sx={{
          width: { xs: "100dvw", sm: "430px" },
          height: "100dvh",
          overflowY: "auto",
          bgcolor: "background.paper",
        }}
      >
        {/* Header */}
        <DialogContent
          dividers
          sx={{ p: "6px 12px", backgroundColor: "#F5F5F5" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" sx={{ ml: 1 }}>
              Cart
            </Typography>
            <IconButton
              sx={{ mr: -1 }}
              onClick={() => setCartOpen({ right: false })}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogContent>

        {/* Cart Lines */}
        <Box sx={{ px: 2, pt: 1 }}>
          {lines.length > 0 ? (
            lines.map((line) => {
              const isVisible = removedItems[line.id] ?? true;
              return (
                <Slide
                  key={line.id}
                  in={isVisible}
                  direction="left"
                  timeout={300}
                >
                  <Box
                    sx={{
                      padding: "24px 0",
                      display: "flex",
                      borderBottom: "1px solid #e0e0e0",
                      "&:last-child": { borderBottom: 0 },
                    }}
                  >
                    <Fade in={isVisible} timeout={300} style={{ width: '100%' }}>
                      <Box sx={{ display: "flex", flexDirection: "row" }}>
                        {/* Thumbnail */}
                        {line.merchandise.image && (
                          <Box
                            sx={{
                              position: "relative",
                              flexShrink: 0,
                              width: "112px",
                              overflow: "hidden",
                              transition: "opacity 0.3s",
                              "&:hover": { opacity: 0.95 },
                              cursor: "pointer",
                              border: '1px solid #e0e0e0',
                              borderRadius: 1
                            }}
                          >
                            <Link
                              href={`/${line.merchandise.product.handle}`}
                              style={{ textDecoration: "none" }}
                            >
                              <Box
                                component='img'
                                loading="lazy"
                                src={line.merchandise.image.url}
                                alt={
                                  line.merchandise.image.altText ||
                                  line.merchandise.title
                                }
                                sx={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  "&:hover": { scale: 1.2 },
                                  transition: 'all 0.3s cubic-bezier(.4,0,.22,1)'
                                }}
                              />
                            </Link>
                          </Box>
                        )}

                        {/* Title, Remove, Quantity, Price */}
                        <Box
                          sx={{
                            ml: 2,
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: 1,
                          }}
                        >
                          {/* Title + Remove button */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "start",
                              fontWeight: "bold",
                              gap: 2,
                            }}
                          >
                            <Box
                              sx={{ cursor: "pointer" }}
                            >
                              <Link
                                href={`/${line.merchandise.product.handle}`}
                                style={{
                                  textDecoration: "none",
                                  color: "#2d2a26",
                                }}
                              >
                                <Typography variant="body2">
                                  {line.merchandise.product.title}
                                </Typography>
                              </Link>
                            </Box>
                            <IconButton
                              sx={{  
                                position: 'relative',
                                top: -10,
                                right: -12
                              }}
                              onClick={() => handleRemoveLine(line.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>

                          {/* Quantity input & Price */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-end",
                              flexGrow: 1,
                              mt: 1,
                            }}
                          >
                            <NumberFieldForProductInfoPage
                              // ← Here we read `line.quantity` directly:
                              value={line.quantity}
                              handleChange={(val) =>
                                handleQuantityChange(line.id, val)
                              }
                            />

                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ color: "rgba(0, 0, 0, 0.7)" }}
                              >
                                ${parseFloat(line.merchandise.price.amount)}
                                {line.quantity > 1
                                  ? ` × ${line.quantity}`
                                  : ""}
                              </Typography>
                              {line.quantity > 1 ? (
                                <>
                                  <Divider
                                    sx={{
                                      my: 1,
                                      borderColor: "#C4C4C4",
                                      borderStyle: "dashed",
                                    }}
                                  />
                                  <Box sx={{ float: "right" }}>
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "rgba(0, 0, 0, 0.7)" }}
                                    >
                                      $
                                      {(
                                        parseFloat(
                                          line.merchandise.price.amount
                                        ) * line.quantity
                                      ).toFixed(2)}
                                    </Typography>
                                  </Box>
                                </>
                              ) : null}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Fade>
                  </Box>
                </Slide>
              );
            })
          ) : (
            <Typography
              variant="h6"
              sx={{ mt: 6, textAlign: "center", color: "text.secondary" }}
            >
              Your Cart is Empty!
            </Typography>
          )}
        </Box>
      </Box>

      {/* Subtotal + Buttons */}
      {lines.length > 0 && (
        <Box
          sx={{
            backgroundColor: "#F5F5F5",
            borderTop: 1,
            borderColor: "divider",
            py: 3,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "medium",
            }}
          >
            <Typography>Subtotal</Typography>
            <Typography>${cartTotal.toFixed(2)}</Typography>
          </Box>
          <Typography
            sx={{ mt: 0.5, fontSize: "0.875rem", color: "text.secondary" }}
          >
            Shipping and taxes calculated at checkout.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Link href={checkoutUrl || ''} style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  px: 3,
                  py: 2,
                  borderRadius: 1,
                  bgcolor: "#2d2a26",
                  color: "#fff",
                  "&:hover": {
                    bgcolor: "grey.800",
                  },
                }}
              >
                <Typography variant="body1" fontWeight="600">
                  Checkout
                </Typography>
              </Button>
            </Link>
          </Box>

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "0.875rem",
              color: "text.secondary",
            }}
          >
            <Typography sx={{ fontSize: "0.875rem" }}>
              or{" "}
            </Typography>
            <Button
              onClick={() => setCartOpen({ right: false })}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "medium",
                "&:hover": { color: "black", backgroundColor: "transparent" },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                ml: 0.5,
              }}
            >
              Continue Shopping<ArrowRightAlt sx={{ pl: 1 }} />
            </Button>
          </Box>
        </Box>
      )}
    </SwipeableDrawer>
  );
}
