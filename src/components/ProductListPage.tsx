"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  // ─── Derive a sorted array of unique brands from the product list ──────────────────
  const brands = useMemo(() => {
    const set = new Set<string>();
    list.forEach((p) => {
      if (p.brand && p.brand.trim() !== "") {
        set.add(p.brand);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [list]);

  // ─── Initialize and sync checkbox state for each brand ────────────────────────────
  const [checkedBrands, setCheckedBrands] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Whenever `brands` changes, reset checked state for each brand to false
    const initialState: Record<string, boolean> = {};
    brands.forEach((b) => {
      initialState[b] = false;
    });
    setCheckedBrands(initialState);
  }, [brands]);

  // ─── State for the Sort By and Filter By Brand dropdowns ─────────────────────────
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [filterBrand, setFilterBrand] = useState<string>("all");

  const handleSortChange = (e: SelectChangeEvent<string>) => {
    setSortBy(e.target.value);
    // …hook into your actual sort logic here…
  };

  const handleFilterBrandChange = (e: SelectChangeEvent<string>) => {
    setFilterBrand(e.target.value);
    // …hook into your actual “filter by brand” logic here…
  };

  // Toggle a single brand checkbox on/off
  const toggleBrandCheckbox = (brand: string) => {
    setCheckedBrands((prev) => ({
      ...prev,
      [brand]: !prev[brand],
    }));
    // …hook into your actual “toggle this brand off/on” logic here…
  };

  // ─── Compute filtered list based on filterBrand or checkedBrands if needed ────────
  // (This is just a placeholder; replace with your real filter logic.)
  const filteredList = useMemo(() => {
    let temp = list;

    // If a dropdown filter is set (not “all”), filter by that brand
    if (filterBrand !== "all") {
      temp = temp.filter((p) => p.brand === filterBrand);
    }

    // If any checkboxes are checked, only include those brands
    const activeChecks = Object.entries(checkedBrands)
      .filter(([, checked]) => checked)
      .map(([b]) => b);
    if (activeChecks.length > 0) {
      temp = temp.filter((p) => activeChecks.includes(p.brand));
    }

    // 3) Sort according to sortBy
    if (sortBy === "priceLow") {
      temp = [...temp].sort(
        (a, b) => parseFloat(a.price.amount) - parseFloat(b.price.amount)
      );
    } else if (sortBy === "priceHigh") {
      temp = [...temp].sort(
        (a, b) => parseFloat(b.price.amount) - parseFloat(a.price.amount)
      );
    } else if (sortBy === "newest") {
      // Newest Arrivals: sort by createdAt descending
      temp = [...temp].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    // else if sortBy === 'bestSellers', do nothing: preserve original order from `list`
    return temp;
  }, [list, filterBrand, checkedBrands, sortBy]);

  // ────────────────────────────────────────────────────────────────────────────────

  return (
    <Grid
      container
      spacing={2}
      sx={{
        maxWidth: "1500px",
        width: "100%",
        mx: "auto",
        flexGrow: 1,
        p: 3,
      }}
    >
      {/* ─── Breadcrumbs + Category Title (always top-left) ────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <BreadcrumbsNav segments={segments} names={names} />
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mt: 1, textTransform: "uppercase", fontWeight: 500 }}
        >
          {title}
        </Typography>
      </Box>

      {/* ─── Top-level Grid: Sidebar (Filters) on left, Main Content on right ───── */}
      <Grid
        container
        spacing={2}
        sx={{ justifyContent: "center", maxWidth: "1500px", width: "100%", mx: "auto" }}
      >
        {/* ─────── Left Column: Filters Sidebar ─────── */}
        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{
            borderRight: { md: "1px solid rgba(0,0,0,0.12)" },
            px: { xs: 0 },
            py: { xs: 2, md: 0 },
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Brand
          </Typography>
          <FormGroup>
            {brands.map((brand) => {
              // Compute count of products for this brand dynamically
              const countByBrand = list.filter((p) => p.brand === brand).length;
              return (
                <FormControlLabel
                  key={brand}
                  control={
                    <Checkbox
                      checked={checkedBrands[brand] || false}
                      onChange={() => toggleBrandCheckbox(brand)}
                    />
                  }
                  label={`${brand} (${countByBrand})`}
                />
              );
            })}
          </FormGroup>
        </Grid>

        {/* ─────── Right Column: Main Content Area ─────── */}
        <Grid size={{ xs: 12, md: 9 }}>
          {/* ─── “Sort By” + “Brand” Selects ──────────────────────────────── */}
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
                  <MenuItem value="relevance">Best Sellers</MenuItem>
                  <MenuItem value="priceLow">Price: Low → High</MenuItem>
                  <MenuItem value="priceHigh">Price: High → Low</MenuItem>
                  <MenuItem value="newest">Newest Arrivals</MenuItem>
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
                  {brands.map((brand) => (
                    <MenuItem key={brand} value={brand}>
                      {brand}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Right side: showing how many results */}
            <Typography variant="subtitle1" sx={{ mt: { xs: 1, md: 0 } }}>
              {filteredList.length} Results
            </Typography>
          </Box>

          {/* ─── Product List as a Vertical Stack ─────────────────────────── */}
          <Stack spacing={2}>
            {filteredList.map((product) => (
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