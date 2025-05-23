import React, { useState, useMemo, useEffect } from 'react';
import {
  Grid,
  Autocomplete,
  TextField,
  InputAdornment,
  Divider,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Document } from 'flexsearch';

// dummy product data
interface Product extends Record<string, string | number> {
  id: number;
  name: string;
}

const DUMMY_PRODUCTS: Product[] = [
  { id: 1, name: 'Brake Pad Set' },
  { id: 2, name: 'Oil Filter' },
  { id: 3, name: 'Air Intake Hose' },
  { id: 4, name: 'Spark Plug x4' },
  { id: 5, name: 'Headlight Bulb (H11)' },
  { id: 6, name: 'Battery 12V 75Ah' },
  { id: 7, name: 'Windshield Wiper Blade' },
  { id: 8, name: 'Engine Coolant 1L' },
  { id: 9, name: 'Brake Rotor (Front)' },
];

export default function ProductSearch() {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Product[]>([]);

  // 1) build a FlexSearch.Document index once
  const index = useMemo(() => new Document({
    document: { id: 'id', index: ['name'] },
    tokenize: 'forward',
    cache: true,
  }), []);

  // 2) add all products to the index on mount
  useEffect(() => {
    DUMMY_PRODUCTS.forEach(p => index.add(p));
  }, [index]);

  // 3) on every input change, query the index
  const handleInputChange = (_: unknown, value: string) => {
    setInputValue(value);

    if (value.length > 0) {
      // 1) Run your search (enrich:true gives hits with either number or {id,doc,...})
      const rawResults = index.search(value, { enrich: true }) as Array<{
        result: Array<
          number |
          { id: number; doc: unknown; highlight?: string }
        >
      }>;

      // 2) Normalize every hit to a plain number ID
      const ids = rawResults.flatMap(r =>
        r.result.map(item =>
          typeof item === 'object' ? item.id : item
        )
      );

      // 3) Dedupe
      const uniqueIds = Array.from(new Set(ids));

      // 4) Map back to your products safely
      const matches = uniqueIds
        .map(idNum => DUMMY_PRODUCTS.find(p => p.id === idNum))
        .filter((p): p is Product => Boolean(p));

      setOptions(matches);
    } else {
      setOptions([]);
    }
  };

  return (
    <Grid
      sx={{
        width: '100%',
        '@media (max-width:700px)': { display: 'none' },
      }}
    >
      <Autocomplete<Product, false, false, true>
        freeSolo
        options={options}
        getOptionLabel={(opt) =>
          typeof opt === 'string' ? opt : opt.name
        }
        inputValue={inputValue}
        onInputChange={handleInputChange}
        sx={{ 
          "& .MuiOutlinedInput-root": {
            px: "10px !important",
          }
         }}
        renderInput={params => (
          <TextField
            {...params}
            placeholder="Find Parts and Products"
            variant="outlined"
            size="small"
            sx={{ bgcolor: '#FFF' }}
            InputProps={{
              ...params.InputProps,
              // left search icon
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              // right “| SEARCH” after you type at least 1 char
              ...(inputValue.length > 0 && {
                endAdornment: (
                  <InputAdornment position="end">
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Button 
                      variant="text"
                      size="small"
                    >
                      SEARCH
                    </Button>
                  </InputAdornment>
                ),
              }),
            }}
          />
        )}
      />
    </Grid>
  );
}