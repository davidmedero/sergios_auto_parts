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
  const [year, setYear] = useState<number | null>(2026);
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

  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ position: 'relative' }}>
        <Typography sx={{ fontSize: '24px', textAlign: 'center' }}>Choose a New Vehicle</Typography>
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
      >
        <Tab label="Make/Model" />
        <Tab label="License Plate" />
        <Tab label="VIN" />
      </Tabs>

      <DialogContent>
        {tabIndex === 0 && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 3 }}>
                <Autocomplete<number, false, false, false>
                  options={yearOptions}
                  value={year}
                  onChange={(_, v) => setYear(v)}
                  getOptionLabel={(opt) => opt.toString()}
                  renderInput={(p) => <TextField {...p} label="Year" />}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <Autocomplete<MakeOption, false, false, false>
                  options={makeOptions}
                  getOptionLabel={(opt) => opt.label}
                  value={make}
                  onChange={(_, v) => setMake(v)}
                  renderInput={(p) => <TextField {...p} label="Make" />}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <Autocomplete<string, false, false, false>
                  options={modelOptions}
                  getOptionLabel={(opt) => opt}
                  value={model}
                  onChange={(_, v) => setModel(v)}
                  renderInput={(p) => <TextField {...p} label="Model" />}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
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
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2} alignItems="center">
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
              <Grid size={{ xs: 12, sm: 9 }}>
                <TextField
                  fullWidth
                  label="License Plate"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {tabIndex === 2 && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="VIN"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
            />
          </Box>
        )}
        <Grid container sx={{ justifyContent: 'center', mx: 'auto', mt: 3 }}>
          <Button variant='text'>Manage Vehicles</Button>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleSelectorModal;
