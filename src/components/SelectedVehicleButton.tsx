"use client";

import React, { FC } from "react";
import { Box, Typography, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { FaCar } from "react-icons/fa";

interface SelectedVehicleButtonProps {
  vehicleLabel: string;
  onClick: () => void;
}

const SelectedVehicleButton: FC<SelectedVehicleButtonProps> = ({
  vehicleLabel,
  onClick
}) => (
  <Button
    onClick={onClick}
    sx={{
      width: "240px",
      borderRadius: 1,
      py: 0.5,
      px: 2,
      display: "flex",
      alignItems: "center",
      textAlign: "left",
      textTransform: "none",
      "@media (max-width:480px)": {
        width: '100%',
        px: 1,
      },
      "&:hover": {
        bgcolor: "rgba(21, 101, 192, 0.1)"
      }
    }}
  >
    <Box 
      sx={{ 
        position: "relative",
        mr: 2,
        flexShrink: 0,
        top: 4 ,
        "@media (max-width:480px)": {
          mr: 0,
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

    <Box 
      sx={{ 
        display: "inline-flex",
        alignItems: "center" ,
        "@media (max-width:480px)": {
          display: 'none',
        }   
      }}
    >
      <Typography
        variant="body2"
        sx={{
          lineHeight: 1.333,
          color: "#2d2a26",
          fontSize: "12px",
          fontWeight: 400,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {vehicleLabel}
      </Typography>
      <ChevronRightIcon 
        sx={{ 
          color: "#2d2a26",
        }} 
      />
    </Box>
  </Button>
);

export default SelectedVehicleButton;