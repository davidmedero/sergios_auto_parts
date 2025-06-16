"use client"

import React, { FC, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Autocomplete,
  TextField,
  IconButton,
  Grid,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useVehicles, Vehicle } from '@/contexts/VehiclesContext';
import { useRouter } from 'next/navigation';
import CurrentlyShoppingForCard from './CurrentlyShoppingForCard';
import SavedVehiclesCard from './SavedVehiclesCard';

// ----- Types -----
interface VehicleSelectorModalProps {
  open: boolean;
  onClose: () => void;
}
interface MakeOption { label: string; popular?: boolean; }
interface StateOption { code: string; name: string; }

// ----- State Options -----
const stateOptions: StateOption[] = [
  // ... same as before ...
];

// ----- Component -----
const VehicleSelectorModal: FC<VehicleSelectorModalProps> = ({ open, onClose }) => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [year, setYear] = useState<string | null>(null);
  const [make, setMake] = useState<MakeOption | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [engine, setEngine] = useState<string | null>(null);
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [vin, setVin] = useState<string>('');
  const [selectedState, setSelectedState] = useState<StateOption | null>(null);

  // Options
  const [yearOptions, setYearOptions] = useState<string[]>([]);
  const [makeOptions, setMakeOptions] = useState<MakeOption[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [engineOptions, setEngineOptions] = useState<string[]>([]);

  // Loading flags
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingEngines, setLoadingEngines] = useState(false);

  const router = useRouter();
  const { vehicles, currentVehicleId, addVehicle, setCurrentVehicle, setCurrentVehicleId } = useVehicles();

  // Currently shopping for
  const current = vehicles.find(v => v.id === currentVehicleId) ?? null;
  const saved = vehicles.filter(v => v.id !== currentVehicleId);

  const handleConfirm = () => {
    const label = tabIndex === 0
      ? `${year} ${make?.label ?? ""} ${model ?? ""} ${engine ?? ""}`.trim()
      : "";

    const newVehicle: Vehicle = {
      id: crypto.randomUUID(),
      label,
      year: year?.toString() ?? "",
      make_name: make?.label ?? "",
      model_name: model ?? "",
      engine_base_name: engine ?? ""
    };
    addVehicle(newVehicle);
    onClose();
  };

  useEffect(() => {
    if (open) {
      setTabIndex(0);
      setYear(null); setMake(null); setModel(null); setEngine(null);
      setLicensePlate(''); setVin(''); setSelectedState(null);
      setMakeOptions([]); setModelOptions([]); setEngineOptions([]);
    }
  }, [open]);

  // Years
  useEffect(() => {
    setLoadingYears(true);
    fetch('/api/years')
      .then(res => res.json() as Promise<{ years: string[] }>)
      .then(({ years }) => {
        const sorted = [...years].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
        setYearOptions(sorted);
      })
      .finally(() => setLoadingYears(false));
  }, []);

  // Makes
  useEffect(() => {
    setMakeOptions([]);
    if (!year) return;
    setLoadingMakes(true);
    fetch(`/api/makes?year=${year}`)
      .then(res => res.json() as Promise<{ makes: string[] }>)
      .then(({ makes }) => setMakeOptions(makes.map(label => ({ label }))))
      .finally(() => setLoadingMakes(false));
  }, [year]);

  // Models
  useEffect(() => {
    setModelOptions([]);
    if (!year || !make) return;
    setLoadingModels(true);
    fetch(`/api/models?year=${year}&make_name=${make.label}`)
      .then(res => res.json() as Promise<{ models: string[] }>)
      .then(({ models }) => setModelOptions(models))
      .finally(() => setLoadingModels(false));
  }, [year, make]);

  // Engines
  useEffect(() => {
    setEngineOptions([]);
    if (!year || !make || !model) return;
    setLoadingEngines(true);
    fetch(
      `/api/engines?year=${year}&make_name=${make.label}&model_name=${encodeURIComponent(model)}`
    )
      .then(res => res.json() as Promise<{ engines: string[] }>)
      .then(({ engines }) => setEngineOptions(Array.from(new Set(engines))))
      .finally(() => setLoadingEngines(false));
  }, [year, make, model]);

  useEffect(() => { if (engine) handleConfirm(); }, [engine]);

  const handleLicenseLookup = async () => {
    if (!selectedState || !licensePlate.trim()) return;

    const lookup = licensePlate.trim().toUpperCase();
    try {
      const res = await fetch(
        `/api/license-decode?license_plate=${lookup}&state=${selectedState.code}`
      );
      if (!res.ok) throw new Error(`Lookup failed (${res.status})`);

      const json = await res.json();
      console.log("decoded plate data:", json);
      const basic = json.data.basic;
      const label = `${basic.year} ${basic.make} ${basic.model}`;

      const newVehicle: Vehicle = {
        id: crypto.randomUUID(),
        label,
        year: year?.toString() ?? "",
        make_name:        make?.label ?? "",
        model_name:       model ?? "",
        engine_base_name: engine ?? ""
      };

      addVehicle(newVehicle);
    } catch (err) {
      console.error("License-decode error:", err);
    }
  };

  const handleVinLookup = async () => {
    const rawVin = vin.trim();
    if (!rawVin) return;

    try {
      const res = await fetch(`/api/vin-decode?vin=${encodeURIComponent(rawVin)}`);
      if (!res.ok) throw new Error(`VIN lookup failed (${res.status})`);

      const json = await res.json();
      console.log("decoded VIN data:", json);
      const basic = json.data.basic; 
      const label = `${basic.year} ${basic.make} ${basic.model}`;

      const newVehicle: Vehicle = {
        id: crypto.randomUUID(),
        label,
        year: year?.toString() ?? "",
        make_name:        make?.label ?? "",
        model_name:       model ?? "",
        engine_base_name: engine ?? ""
      };

      addVehicle(newVehicle)
    } catch (err) {
      console.error("VIN-decode error:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ position: 'relative' }}>
        <Typography sx={{ fontSize:24, textAlign:'center' }}>Choose a New Vehicle</Typography>
        <IconButton onClick={onClose} sx={{ position:'absolute', right:18, top:6 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Tabs value={tabIndex} onChange={(_, v)=>setTabIndex(v)}>
        <Tab label="Make/Model" />
        <Tab label="License Plate" />
        <Tab label="VIN" />
      </Tabs>

      <DialogContent>
        {tabIndex === 0 && (
          <Box mt={2}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 3 }}>
                <Autocomplete
                  options={yearOptions}
                  value={year}
                  loading={loadingYears}
                  loadingText="Loading years..."
                  onChange={(_, v) => { setYear(v); setMake(null); setModel(null); setEngine(null); }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Year"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingYears && <CircularProgress color="inherit" size={20} />}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <Autocomplete
                  options={makeOptions}
                  value={make}
                  getOptionLabel={opt=>opt.label}
                  loading={loadingMakes}
                  loadingText="Loading makes..."
                  onChange={(_, v) => { setMake(v); setModel(null); setEngine(null); }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Make"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingMakes && <CircularProgress color="inherit" size={20} />}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <Autocomplete
                  options={modelOptions}
                  value={model}
                  loading={loadingModels}
                  loadingText="Loading models..."
                  getOptionLabel={opt=>opt}
                  onChange={(_, v)=>{ setModel(v); setEngine(null); }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Model"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingModels && <CircularProgress color="inherit" size={20} />}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <Autocomplete
                  options={engineOptions}
                  value={engine}
                  loading={loadingEngines}
                  loadingText="Loading engines..."
                  onChange={(_, v)=>setEngine(v)}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Engine"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingEngines && <CircularProgress color="inherit" size={20} />}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        )}
        {tabIndex === 1 && (
          <Grid container spacing={2} alignItems="center"  sx={{ mt: 2 }}>
            {/* State Selector */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <Autocomplete<StateOption, false, false, false>
                options={stateOptions}
                getOptionLabel={(opt) => opt.name}
                value={selectedState}
                onChange={(_, v) => setSelectedState(v)}
                renderInput={(params) => <TextField {...params} label="State" />}                
              />
            </Grid>

            {/* License Plate Input */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="License Plate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
              />
            </Grid>

            {/* Lookup Button */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button
                variant="contained"
                fullWidth
                disabled={!selectedState || !licensePlate.trim()}
                onClick={handleLicenseLookup}
              >
                Lookup Plate
              </Button>
            </Grid>
          </Grid>
        )}

        {tabIndex === 2 && (
          <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, sm: 9 }}>
              <Box>
                <TextField
                  fullWidth
                  label="VIN"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button
                variant="contained"
                fullWidth
                disabled={!vin.trim()}
                onClick={handleVinLookup}
              >
                Lookup VIN
              </Button>
            </Grid>
          </Grid>
        )}
        {
          vehicles.length === 0 ? (
            <Grid container sx={{ justifyContent: 'center', mx: 'auto', mt: 3 }}>
              <Button 
                variant='text'
                onClick={() => {  
                  onClose();
                  router.push('/vehicles');
                }}>
                  Manage Vehicles
              </Button>
            </Grid>
          ) : null
        }

        {/* Bottom Content */}
        {
          vehicles.length >= 1 && currentVehicleId && currentVehicleId.length > 0 ? (
            <Grid container spacing={4} sx={{ mt: 4, pb: '4px' }}>
            {/* Left: Currently Shopping For */}
            {
              vehicles.length >= 1 && currentVehicleId !== null ? (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" gutterBottom>Currently Shopping For:</Typography>
                  {current ? (
                    <CurrentlyShoppingForCard
                      vehicleLabel={current.label}
                    />
                  ) : (
                    <Typography color="text.secondary">No current vehicle</Typography>
                  )}
                  <Box sx={{ display: "flex", mt: 2, gap: 1, flexWrap: "wrap" }}>
                    <Button variant="text" onClick={() => { onClose(); router.push('/vehicles'); }}>
                      Manage Vehicles
                    </Button>
                    <Button 
                      variant="text"  
                      onClick={() => { 
                        setCurrentVehicleId(null);
                        onClose(); 
                      }}>
                      Shop Without Vehicle
                    </Button>
                  </Box>
                </Grid>
              ) : null
            }

            {/* Right: Saved Vehicles */}
            {
              vehicles.length > 1 ? (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" gutterBottom>Saved Vehicles:</Typography>
                  <Grid container direction="column" spacing={2}>
                    {saved.map(v => (
                      <Grid key={v.id}>
                        <SavedVehiclesCard
                          vehicleLabel={v.label}
                          onClick={() => {
                            setCurrentVehicle(v.id)
                            onClose();
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              ) : null
            }
          </Grid>
          ) : null
        }

        {
          vehicles.length >= 1 && currentVehicleId === null ? (
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }} sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>Saved Vehicles:</Typography>
                <Grid container direction="column" spacing={2}>
                  {saved.map(v => (
                    <Grid key={v.id}>
                      <SavedVehiclesCard
                        vehicleLabel={v.label}
                        onClick={() => {
                          setCurrentVehicle(v.id)
                          onClose();
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ display: "flex", mt: 2, gap: 1, flexWrap: "wrap" }}>
                  <Button variant="text" onClick={() => { onClose(); router.push('/vehicles'); }}>
                    Manage Vehicles
                  </Button>
                  <Button 
                    variant="text"  
                    onClick={() => { 
                      setCurrentVehicleId(null);
                      onClose(); 
                    }}>
                    Shop Without Vehicle
                  </Button>
                </Box>
              </Grid>
            </Grid>
          ) : null
        }
      </DialogContent>
    </Dialog>
  );
};

export default VehicleSelectorModal;
