"use client";

import React, { useState } from "react";
import { AppBar, Toolbar, Button, Grid, Box } from "@mui/material";
import VehicleSelectorModal from "./VehicleSelectorModal";
import SelectedVehicleButton from "./SelectedVehicleButton";
import { useVehicles } from "@/contexts/VehiclesContext";
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { vehicles, currentVehicleId } = useVehicles();
  const currentVehicle = vehicles.find(v => v.id === currentVehicleId) || null;

  const router = useRouter();

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Grid container sx={{ justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <Button 
              sx={{ color: '#fff', textTransform: "none", fontSize: '24px' }} 
              onClick={() => {  
                router.push('/');
              }}
            >
              Sergios Auto Parts
            </Button>
            <Box>
              {currentVehicle ? (
                <SelectedVehicleButton
                  showCheck={true}
                  vehicleLabel={currentVehicle.label}
                  onClick={() => setModalOpen(true)}
                />
              ) : (
                <Button variant="text" onClick={() => setModalOpen(true)} sx={{ color: "#fff" }}>
                  Select Your Vehicle
                </Button>
              )}
            </Box>
          </Grid>
        </Toolbar>
      </AppBar>
      {/* Vehicle Selector Modal */}
      <VehicleSelectorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Navbar;