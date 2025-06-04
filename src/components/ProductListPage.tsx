"use client";

import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BreadcrumbsNav from "./BreadcrumbsNav";
import ProductCard, { Product } from "./ProductCard";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";

interface Props {
  title:    string;
  segments: string[];
  names:    string[];
  list:     Product[];
}

export default function ProductListPage({
  title,
  segments,
  names,
  list,
}: Props) {
  // ─── Example state for the two dropdowns and the Brand checkboxes ──────────────────
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [checkedBrands, setCheckedBrands] = useState<{ [brand: string]: boolean }>({
    ACDelco:  false,
    Duralast: false,
  });

  const handleSortChange = (e: SelectChangeEvent<string>) => {
    setSortBy(e.target.value);
    // …hook into your actual sort logic here…
  };

  const handleFilterBrandChange = (e: SelectChangeEvent<string>) => {
    setFilterBrand(e.target.value);
    // …hook into your actual “filter by brand” logic here…
  };

  const toggleBrandCheckbox = (brand: string) => {
    setCheckedBrands(prev => ({
      ...prev,
      [brand]: !prev[brand],
    }));
    // …hook into your actual “toggle this brand off/on” logic here…
  };

  // ─── End example filter state ───────────────────────────────────────────────────────

  return (
    <Grid container spacing={2} sx={{ maxWidth: '1500px', width: '100%', mx: 'auto', flexGrow: 1, p: 3 }}>
      {/* ─── Breadcrumbs + Category Title (always top-left of this column) ─── */}
      <Box sx={{ mb: 3 }}>
        <BreadcrumbsNav segments={segments} names={names} />
        <Typography variant="h4" gutterBottom sx={{ mt: 1, textTransform: 'uppercase', fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
      {/* ───────── Top‐level Grid: Sidebar (Filters) on left, Main Content on right ───────── */}
      <Grid container spacing={2} sx={{ justifyContent: 'center', maxWidth: '1500px', width: '100%', mx: 'auto' }}>
        {/* ─────── Left Column: Filters Sidebar ─────── */}
        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{
            borderRight: { md: "1px solid rgba(0,0,0,0.12)" },
            // On very narrow screens, hide the border and show full width
            px: { xs: 0 },
            py: { xs: 2, md: 0 },
          }}
        >
          {/* You can add as many filter sections as you like. 
              Here’s a “Brand” section to match your screenshot: */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            Brand
          </Typography>
          <FormGroup>
            {Object.keys(checkedBrands).map((brand) => (
              <FormControlLabel
                key={brand}
                control={
                  <Checkbox
                    checked={checkedBrands[brand]}
                    onChange={() => toggleBrandCheckbox(brand)}
                  />
                }
                label={`${brand} (${checkedBrands[brand] ? 1 : 1})`}
                // In the real world, you’d display the count dynamically
                // e.g. `(${countByBrand[brand]})`.
              />
            ))}
          </FormGroup>

          {/* You could add more filter sections (Price Range, Position, etc.) below… */}
        </Grid>

        {/* ─────── Right Column: Main Content Area ─────── */}
        <Grid size={{ xs: 12, md: 9 }}>
          {/* ─── “Sort By” + “Brand” Selects  ─── */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              mb: 2,
            }}
          >
            {/* Left side: the two dropdowns */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              {/* Sort By */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                  labelId="sort-by-label"
                  value={sortBy}
                  label="Sort By"
                  onChange={handleSortChange}
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="priceLow">Price: Low → High</MenuItem>
                  <MenuItem value="priceHigh">Price: High → Low</MenuItem>
                  <MenuItem value="newest">Newest Arrivals</MenuItem>
                  {/* …other sort options… */}
                </Select>
              </FormControl>

              {/* Filter By Brand (Dropdown) */}
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="filter-brand-label">Brand</InputLabel>
                <Select
                  labelId="filter-brand-label"
                  value={filterBrand}
                  label="Brand"
                  onChange={handleFilterBrandChange}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="ACDelco">ACDelco</MenuItem>
                  <MenuItem value="Duralast">Duralast</MenuItem>
                  {/* …other brand options… */}
                </Select>
              </FormControl>
            </Box>

            {/* Right side: showing how many results */}
            <Typography variant="subtitle1" sx={{ mt: { xs: 1, md: 0 } }}>
              {list.length} Results
            </Typography>
          </Box>

          {/* ─── Product List as a Vertical Stack ─── */}
          <Stack spacing={2}>
            {list.map((product) => (
              <Grid key={product.id} size={{ xs: 12 }}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  );
}
