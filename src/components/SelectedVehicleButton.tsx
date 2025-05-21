"use client";

import React, { FC } from "react";
import { ButtonBase, Box, Typography } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface SelectedVehicleButtonProps {
  vehicleLabel: string;
  onClick: () => void;
}

function clampText(text: string, maxChars = 50) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1).trimEnd() + '…';
}

const SelectedVehicleButton: FC<SelectedVehicleButtonProps> = ({
  vehicleLabel,
  onClick
}) => (
  <ButtonBase
    onClick={onClick}
    sx={{
      width: "240px",
      borderRadius: 1,
      py: 0.5,
      px: 2,
      display: "flex",
      alignItems: "center",
      textAlign: "left",
      bgcolor: "transparent",
      "&:hover": { bgcolor: "#E0E0E0" },
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
        fontSize: "12px",
        fontWeight: 400,
        overflow: "hidden",
      }}
      variant="body2"
    >
      {clampText(vehicleLabel, 39)}
    </Typography>

    <ChevronRightIcon color="action" />
  </ButtonBase>
);

export default SelectedVehicleButton;