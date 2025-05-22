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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { FaCar } from 'react-icons/fa';

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
    <Box 
      sx={{ 
        p: 3,
        "@media (max-width:480px)": {
          p: 2
        }
      }}
    >
      {/* Header and Add Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">My Vehicles</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          <Typography sx={{ color: "#2d2a26" }}>Add a Vehicle</Typography>
        </Button>
      </Box>

      {/* Vehicle List */}
      <Grid 
        container 
        direction="column" 
        spacing={2} 
        sx={{ 
          bgcolor: "#F2F2F2",
          p: 3,
          borderRadius: 1,
          "@media (max-width:480px)": {
            p: 2
          }
        }}
      >
        {sorted.map((veh: Vehicle) => (
          <Grid 
            key={veh.id}
          >
            <Paper 
              elevation={3}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: '16px 24px 16px 24px',
                borderColor: veh.id === currentVehicleId ? 'primary.main' : '',
                borderWidth: veh.id === currentVehicleId ? 2 : 0,
                borderStyle: "solid",
                boxShadow: veh.id === currentVehicleId ? "none" : (theme) => theme.shadows[3]
              }}
            >
              <Grid>
                <Grid 
                  container 
                  spacing={3} 
                  alignItems="center" 
                  sx={{ 
                    flexWrap: "nowrap",
                    "@media (max-width:480px)": {
                      flexWrap: "wrap",
                      gap: 1
                    } 
                  }}
                >
                  {
                    veh.id === currentVehicleId ? (
                      <Box 
                        sx={{ 
                          position: "relative",
                          flexShrink: 0,
                          "@media (max-width:480px)": {
                            display: "none",
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
                    ) : (
                      <Box 
                        sx={{ 
                          position: "relative",
                          flexShrink: 0,
                          "@media (max-width:480px)": {
                            display: "none",
                          } 
                        }}
                      >
                        <FaCar size="2rem" color="#2d2a26" style={{ width: "30px" }} />
                      </Box>
                    )
                  }

                  {
                    veh.id === currentVehicleId ? (
                      <Box 
                        sx={{ 
                          display: "none",
                          position: "relative",
                          flexShrink: 0,
                          "@media (max-width:480px)": {
                            display: "flex",
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
                    ) : (
                      <Box 
                        sx={{ 
                          display: "none",
                          position: "relative",
                          flexShrink: 0,
                          "@media (max-width:480px)": {
                            display: "flex",
                          } 
                        }}
                      >
                        <FaCar size="1.5rem" color="#2d2a26" style={{ width: "30px" }} />
                      </Box>
                    )
                  }

                  {/* Vehicle Label */}
                  <Typography 
                    sx={{ 
                      flexGrow: 1,
                      color: "#2d2a26",
                      "@media (max-width:480px)": {
                        fontSize: '14px',
                      } 
                    }}
                  >
                    {veh.label}
                  </Typography>
                </Grid>
                {/* Set as Current Button (if not current) */}
                {veh.id !== currentVehicleId && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setCurrentVehicle(veh.id)}
                    sx={{ textTransform: "none", mt: 2 }}
                  >
                    Set as Current Vehicle
                  </Button>
                )}
              </Grid>

              <Box>
                {/* Delete Icon */}
                <IconButton
                  edge="end"
                  onClick={() => removeVehicle(veh.id)}
                  sx={{ 
                    color: "#2d2a26"
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Modal for Adding Vehicles */}
      <VehicleSelectorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
}