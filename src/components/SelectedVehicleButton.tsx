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

function clampText(text: string, maxChars = 36) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1).trimEnd() + '…';
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
      textTransform: "none"
    }}
  >
    <Box sx={{ position: "relative", mr: 2, flexShrink: 0, top: 4 }}>
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
        fontSize: "12px",
        fontWeight: 400,
        overflow: "hidden",
      }}
      variant="body2"
    >
      {clampText(vehicleLabel, 36)}
    </Typography>

    <ChevronRightIcon color="action" />
  </Button>
);

export default SelectedVehicleButton;