"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useVehicles, Vehicle } from '@/contexts/VehiclesContext';
import VehicleSelectorModal from '@/components/VehicleSelectorModal';
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function ManageVehiclesPage() {
  const { vehicles, currentVehicleId, removeVehicle, setCurrentVehicle } = useVehicles();
  const [modalOpen, setModalOpen] = useState(false);

  // Sort: current first
  const sorted = React.useMemo(() => {
    if (!currentVehicleId) return vehicles;
    const current = vehicles.find(v => v.id === currentVehicleId);
    const others = vehicles.filter(v => v.id !== currentVehicleId);
    return current ? [current, ...others] : vehicles;
  }, [vehicles, currentVehicleId]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header and Add Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">My Vehicles</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Add a Vehicle
        </Button>
      </Box>

      {/* Vehicle List */}
      <Grid container direction="column" spacing={2} sx={{ bgcolor: "#F2F2F2", p: 3, borderRadius: 1 }}>
        {sorted.map((veh: Vehicle) => (
          <Grid 
            key={veh.id}
          >
            <Paper 
              elevation={3}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: '16px 24px 16px 16px',
                borderColor: veh.id === currentVehicleId ? 'primary.main' : '',
                borderWidth: veh.id === currentVehicleId ? 2 : 0,
                borderStyle: "solid",
                boxShadow: veh.id === currentVehicleId ? "none" : (theme) => theme.shadows[3]
              }}
            >
              {
                veh.id === currentVehicleId ? (
                  <Box sx={{ position: "relative", flexShrink: 0 }}>
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
                ) : (
                  <DirectionsCarIcon fontSize="large" color="action" />
                )
              }
              {/* Vehicle Label */}
              <Typography sx={{ flexGrow: 1, color: "#2d2a26", }}>
                {veh.label}
              </Typography>

              {/* Set as Current Button (if not current) */}
              {veh.id !== currentVehicleId && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setCurrentVehicle(veh.id)}
                  sx={{ textTransform: "none" }}
                >
                  Set as Current Vehicle
                </Button>
              )}

              {/* Delete Icon */}
              <IconButton
                edge="end"
                onClick={() => removeVehicle(veh.id)}
                sx={{ color: "#2d2a26" }}
              >
                <DeleteIcon />
              </IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Modal for Adding Vehicles */}
      <VehicleSelectorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
}