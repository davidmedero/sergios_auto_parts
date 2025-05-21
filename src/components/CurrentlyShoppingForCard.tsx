"use client";

import React, { FC } from "react";
import { Box, Typography, Paper } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface CurrentlyShoppingForCardProps {
  vehicleLabel: string;
}

const CurrentlyShoppingForCard: FC<CurrentlyShoppingForCardProps> = ({
  vehicleLabel,
}) => (
  <Paper elevation={2}>
    <Box
      sx={{
        borderRadius: 1,
        p: 2,
        display: "flex",
        alignItems: "center",
        textAlign: "left",
        bgcolor: "transparent",
        cursor: "auto"
      }}
    >
      <Box sx={{ position: "relative", mr: 2, flexShrink: 0 }}>
        <DirectionsCarIcon fontSize="large" color="action" />
        <CheckCircleIcon
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            bgcolor: "background.paper",
            borderRadius: "50%",
            color: "success.main",
            fontSize: "1rem",
          }}
        />
      </Box>

      <Typography
        sx={{
          lineHeight: 1.2,
          color: "#2d2a26",
          fontSize: "14px",
          fontWeight: 400,
          overflow: "hidden",
        }}
        variant="body1"
      >
        {vehicleLabel}
      </Typography>

    </Box>
  </Paper>
  
);

export default CurrentlyShoppingForCard;