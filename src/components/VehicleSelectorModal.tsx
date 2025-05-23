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
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import fetchJsonp from 'fetch-jsonp';
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

// CarQuery API response types
interface CarQueryMakeResponse {
  Makes: Array<{ make_display: string }>;
}
interface CarQueryModelResponse {
  Models: Array<{ model_name: string }>;
}
interface CarQueryTrimResponse {
  Trims: Array<{ model_trim: string }>;
}

// ----- State Options -----
const stateOptions: StateOption[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

// ----- Component -----
const VehicleSelectorModal: FC<VehicleSelectorModalProps> = ({ open, onClose }) => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [year, setYear] = useState<number | null>(null);
  const [make, setMake] = useState<MakeOption | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [engine, setEngine] = useState<string | null>(null);
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [vin, setVin] = useState<string>('');
  const [selectedState, setSelectedState] = useState<StateOption | null>(null);
  
  const [makeOptions, setMakeOptions] = useState<MakeOption[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [engineOptions, setEngineOptions] = useState<string[]>([]);

  // Constants for CarQuery supported years
  const MIN_YEAR = 1980;
  const MAX_YEAR = 2022;

  // Generate year list according to API limits
  const yearOptions = Array.from(
    { length: MAX_YEAR - MIN_YEAR + 1 },
    (_, i) => MAX_YEAR - i
  );

  const router = useRouter();

  const { vehicles, currentVehicleId, addVehicle, setCurrentVehicle, setCurrentVehicleId } = useVehicles();

  // Currently shopping
  const current = vehicles.find(v => v.id === currentVehicleId) ?? null;
  const saved = vehicles.filter(v => v.id !== currentVehicleId);

  // confirm selection and add to context
  const handleConfirm = () => {
    const label = tabIndex === 0
      ? `${year} ${make?.label ?? ''} ${model ?? ''} ${engine ?? ''}`.trim()
      : "";

    const newVehicle: Vehicle = {
      id: crypto.randomUUID(),
      label,
    };
    addVehicle(newVehicle);
    onClose();
  };

  // Reset all fields whenever modal is opened
  useEffect(() => {
    if (open) {
      setTabIndex(0);
      setYear(null);
      setMake(null);
      setModel(null);
      setEngine(null);
      setLicensePlate('');
      setVin('');
      setSelectedState(null);
      setMakeOptions([]);
      setModelOptions([]);
      setEngineOptions([]);
    }
  }, [open]);

  useEffect(() => {
    fetchJsonp(
      `https://www.carqueryapi.com/api/0.3/?cmd=getMakes&year=${year}&callback=callback`,
      { jsonpCallback: 'callback' }
    )
      .then(res => res.json() as Promise<CarQueryMakeResponse>)
      .then(data => {
        const makes = data.Makes.map(m => ({ label: m.make_display }));
        setMakeOptions(makes);
      });
  }, [year]);

  // Fetch models
  useEffect(() => {
    if (!make) {
      setModelOptions([]);
      return;
    }
    fetchJsonp(
      `https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${make.label}&year=${year}&callback=callback`,
      { jsonpCallback: 'callback' }
    )
      .then(res => res.json() as Promise<CarQueryModelResponse>)
      .then(data => {
        const models = data.Models.map(m => m.model_name);
        setModelOptions(models);
      });
  }, [make, year]);

  // Fetch trims
  useEffect(() => {
    if (!make || !model) {
      setEngineOptions([]);
      return;
    }
    fetchJsonp(
      `https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${make.label}&model=${model}&year=${year}&callback=callback`,
      { jsonpCallback: 'callback' }
    )
      .then(res => res.json() as Promise<CarQueryTrimResponse>)
      .then(data => {
        const trims = data.Trims.map(t => t.model_trim);
        setEngineOptions(Array.from(new Set(trims)));
      });
  }, [make, model, year]);

  useEffect(() => {
    if (engine && engine.length > 0) {
      handleConfirm();
    }
  }, [engine]);

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
      };

      addVehicle(newVehicle)
    } catch (err) {
      console.error("VIN-decode error:", err);
    }
  };

  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md" 
      sx={{ 
        "@media (max-width:480px)": {
          "& .MuiDialog-paper": {
            width: "calc(100% - 34px)",
            m: "0px !important"
          }
        }
       }}>
      <DialogTitle sx={{ position: 'relative' }}>
        <Typography 
          sx={{ 
            fontSize: '24px',
            textAlign: 'center',
            "@media (max-width:480px)": {
              textAlign: 'left',
              fontSize: '20px',
            }
          }}
        >
          Choose a New Vehicle
        </Typography>
        <IconButton
          edge="end"
          onClick={onClose}
          aria-label="close"
          sx={{ position: 'absolute', right: 18, top: 6 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        aria-label="vehicle selector tabs"
        sx={{
          "@media (max-width:480px)": {
            display: "none"
          }
        }}
      >
        <Tab label="Make/Model" />
        <Tab label="License Plate" />
        <Tab label="VIN" />
      </Tabs>

      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        aria-label="vehicle selector tabs"
        sx={{
          display: "none",
          "@media (max-width:480px)": {
            display: "flex"
          }
        }}
      >
        <Tab label="Make" />
        <Tab label="License" />
        <Tab label="VIN" />
      </Tabs>

      <DialogContent
        sx={{ 
          "@media (max-width:480px)": {
            p: "20px 20px"
          }
        }}
      >
        {tabIndex === 0 && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <Autocomplete<number, false, false, false>
                  options={yearOptions}
                  value={year}
                  onChange={(_, v) => {
                    setYear(v);
                    setMake(null); setMakeOptions([]);
                    setModel(null); setModelOptions([]);
                    setEngine(null); setEngineOptions([]);
                  }}
                  getOptionLabel={(opt) => opt.toString()}
                  renderInput={(p) => <TextField {...p} label="Year" />}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Autocomplete<MakeOption, false, false, false>
                  options={makeOptions}
                  getOptionLabel={(opt) => opt.label}
                  value={make}
                  onChange={(_, v) => {
                    setMake(v);
                    setModel(null); setModelOptions([]);
                    setEngine(null); setEngineOptions([]);
                  }}
                  renderInput={(p) => <TextField {...p} label="Make" />}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Autocomplete<string, false, false, false>
                  options={modelOptions}
                  getOptionLabel={(opt) => opt}
                  value={model}
                  onChange={(_, v) => {
                    setModel(v);
                    setEngine(null); setEngineOptions([]);
                  }}
                  renderInput={(p) => <TextField {...p} label="Model" />}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Autocomplete<string, false, false, false>
                  options={engineOptions}
                  value={engine}
                  onChange={(_, v) => setEngine(v)}
                  renderInput={(p) => <TextField {...p} label="Engine" />}
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
                <Box sx={{ mt: 2 }}>
                  <Button variant="text" onClick={() => { onClose(); router.push('/vehicles'); }}>
                    Manage Vehicles
                  </Button>
                  <Button 
                    variant="text" 
                    sx={{ ml: 2 }} 
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
