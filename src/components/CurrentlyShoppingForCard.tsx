"use client";

import React, { FC } from "react";
import { Box, Typography, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { FaCar } from "react-icons/fa";

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
      <Box 
        sx={{ 
          position: "relative",
          mr: 2,
          flexShrink: 0,
          top: 5,
          "@media (max-width:480px)": {
            display: "none"
          }
        }}
      >
        <FaCar size="2rem" color="#2d2a26" style={{ width: "30px" }} />
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

      <Box 
        sx={{ 
          display: "none",
          position: "relative",
          mr: 2,
          flexShrink: 0,
          top: 5,
          "@media (max-width:480px)": {
            display: "flex"
          }
        }}
      >
        <FaCar size="1.5rem" color="#2d2a26" style={{ width: "30px" }} />
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

    </Box>
  </Paper>
  
);

export default CurrentlyShoppingForCard;