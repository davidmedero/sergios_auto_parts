"use client";

import React, { FC } from "react";
import { ButtonBase, Box, Typography } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface SelectedVehicleButtonProps {
  /** e.g. "2024 Acura Integra A-Spec 1.5L Turbo DOHC VTEC 4cy" */
  vehicleLabel: string;
  onClick: () => void;
  showCheck: boolean;
}

const SelectedVehicleButton: FC<SelectedVehicleButtonProps> = ({
  vehicleLabel,
  onClick,
  showCheck
}) => (
  <ButtonBase
    onClick={onClick}
    sx={{
      width: "100%",
      border: "2px solid",
      borderColor: "primary.main",
      borderRadius: 1,
      p: 1.5,
      display: "flex",
      alignItems: "center",
      textAlign: "left",
      bgcolor: "background.paper",
      "&:hover": {
        bgcolor: "#eaeaea",
      },
    }}
  >
    {/* icon + check badge */}
    <Box sx={{ position: "relative", mr: 2 }}>
      <DirectionsCarIcon fontSize="large" color="action" />
      {
        showCheck ? (
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
        ) : null
      }
    </Box>

    {/* vehicle text */}
    <Typography
      variant="subtitle1"
      sx={{ flexGrow: 1, fontWeight: 600, lineHeight: 1.2, color: "#2d2a26" }}
    >
      {vehicleLabel}
    </Typography>

    {/* chevron */}
    <ChevronRightIcon color="action" />
  </ButtonBase>
);

export default SelectedVehicleButton;