"use client";

import React, { FC } from "react";
import { Box, Typography, Paper, ButtonBase } from "@mui/material";
import { FaCar } from "react-icons/fa";

interface CurrentlyShoppingForCardProps {
  vehicleLabel: string;
  onClick: () => void
}

const CurrentlyShoppingForCard: FC<CurrentlyShoppingForCardProps> = ({
  vehicleLabel,
  onClick
}) => (
  <Paper 
    elevation={2}
    sx={{
      // animate the shadow so it doesn’t snap
      transition: (theme) =>
        theme.transitions.create('box-shadow', {
          duration: theme.transitions.duration.short,
        }),
      // on hover, use the theme’s 8th shadow (same as elevation=8)
      '&:hover': {
        boxShadow: (theme) => theme.shadows[4],
      },
    }}
  >
    <ButtonBase
      onClick={onClick}
      sx={{
        borderRadius: 1,
        p: 2,
        display: "flex",
        alignItems: "center",
        textAlign: "left",
        bgcolor: "transparent",
      }}
    >
      <Box sx={{ position: "relative", mr: 2, flexShrink: 0 }}>
        <FaCar size="2rem" color="#2d2a26" style={{ width: "30px" }} />
      </Box>

      <Typography
        sx={{
          lineHeight: 1.333,
          color: "#2d2a26",
          fontSize: "14px",
          fontWeight: 400,
          overflow: "hidden",
        }}
        variant="body1"
      >
        {vehicleLabel}
      </Typography>

    </ButtonBase>
  </Paper>
  
);

export default CurrentlyShoppingForCard;