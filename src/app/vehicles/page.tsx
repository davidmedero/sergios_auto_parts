"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useVehicles, Vehicle } from '@/contexts/VehiclesContext';
import VehicleSelectorModal from '@/components/VehicleSelectorModal';

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
      <Grid container direction="column" spacing={2}>
        {sorted.map((veh: Vehicle) => (
          <Grid key={veh.id}>
            <Card
              variant="outlined"
              sx={{
                borderColor: veh.id === currentVehicleId ? 'primary.main' : 'grey.300',
                borderWidth: 2,
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Vehicle Label */}
                <Typography sx={{ flexGrow: 1 }}>
                  {veh.label}
                </Typography>

                {/* Set as Current Button (if not current) */}
                {veh.id !== currentVehicleId && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setCurrentVehicle(veh.id)}
                  >
                    Set Current
                  </Button>
                )}

                {/* Delete Icon */}
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={() => removeVehicle(veh.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal for Adding Vehicles */}
      <VehicleSelectorModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Box>
  );
}