"use client";

import React, { FC, useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Grid,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SelectedVehicleButton from "./SelectedVehicleButton";
import VehicleSelectorModal from "./VehicleSelectorModal";
import { useVehicles } from "@/contexts/VehiclesContext";
import { useRouter } from "next/navigation";

const Navbar: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { vehicles, currentVehicleId } = useVehicles();
  const currentVehicle = vehicles.find(v => v.id === currentVehicleId) || null;
  const router = useRouter();

  return (
    <>
      {/* Top Row */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#FFF" }}>
        <Toolbar sx={{ minHeight: 48 }}>
          <Grid container alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
            <Button onClick={() => router.push("/")} sx={{ textTransform: "none" }}>
              <Typography variant="h1" fontSize={24} fontWeight={500} color="#2d2a26">
                Sergios Auto Parts
              </Typography>
            </Button>
            
            <Box>
              <IconButton sx={{ color: "#2d2a26" }}>
                <PersonOutlineIcon />
              </IconButton>
              <IconButton sx={{ color: "#2d2a26" }}>
                <ShoppingCartOutlinedIcon />
              </IconButton>
            </Box>
          </Grid>
        </Toolbar>
      </AppBar>

      {/* Bottom Row */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#F2F2F2" }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Grid container alignItems="center" spacing={2} sx={{ flexWrap: "nowrap", flexGrow: 1, flexShrink: 0 }}>
            {/* Hamburger and Vehicle Selector Container */}
            <Grid container alignItems="center" sx={{ flexWrap: "nowrap", flexShrink: 0 }}>
              {/* Hamburger */}
              <Grid>
                <IconButton size="large" edge="start" sx={{ color: "#2d2a26" }}>
                  <MenuIcon />
                </IconButton>
              </Grid>

              {/* Vehicle selector */}
              <Grid>
                {currentVehicle ? (
                  <SelectedVehicleButton
                    vehicleLabel={currentVehicle.label}
                    onClick={() => setModalOpen(true)}
                  />
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => setModalOpen(true)}
                    sx={{ textTransform: "none" }}
                  >
                    Select Vehicle
                  </Button>
                )}
              </Grid>
            </Grid>

            {/* Search bar and Manage Vehicles Container */}
            <Grid container alignItems="center" sx={{ width: "100%", flexWrap: "nowrap", flexGrow: 1 }}>
              {/* Search bar */}
              <Grid sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  placeholder="Find Parts and Products"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Manage Vehicles */}
              <Button
                variant="outlined"
                onClick={() => router.push("/vehicles")}
                sx={{ textTransform: "none", width: "200px" }}
                >
                  Manage Vehicles
                </Button>
            </Grid>
            
          </Grid>
        </Toolbar>
      </AppBar>

      {/* Vehicle Selector Modal */}
      <VehicleSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default Navbar;