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

import { useVehicles } from "@/contexts/VehiclesContext";

interface Props {
  title:    string;
  segments: string[];
  names:    string[];
  list:     Product[];  // full list from server
}

export default function ProductListPage({
  title,
  segments,
  names,
  list,
}: Props) {
  // ─── 1) Derive all unique brands from the server‐provided list ───────────────────
  const brands = useMemo(() => {
    const set = new Set<string>();
    list.forEach((p) => {
      if (p.brand && p.brand.trim() !== "") {
        set.add(p.brand);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [list]);

  // ─── 2) Manage checkboxes for those brands ─────────────────────────────────────
  const [checkedBrands, setCheckedBrands] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    brands.forEach((b) => {
      initial[b] = false;
    });
    setCheckedBrands(initial);
  }, [brands]);

  // ─── 3) State for dropdowns (sortBy, filterBrand) ─────────────────────────────
  const [sortBy, setSortBy] = useState<string>("bestSellers");
  const [filterBrand, setFilterBrand] = useState<string>("all");

  const handleSortChange = (e: SelectChangeEvent<string>) => {
    setSortBy(e.target.value);
  };
  const handleFilterBrandChange = (e: SelectChangeEvent<string>) => {
    setFilterBrand(e.target.value);
  };
  const toggleBrandCheckbox = (brand: string) => {
    setCheckedBrands((prev) => ({
      ...prev,
      [brand]: !prev[brand],
    }));
  };

  // ─── 4) VEHICLE CONTEXT & FITMENT FETCH ───────────────────────────────────────
  const { vehicles, currentVehicleId } = useVehicles();
  const currentVehicle = vehicles.find((v) => v.id === currentVehicleId) ?? null;

  // We'll store “partNumbers that fit this vehicle” in state:
  const [fitPartNumbers, setFitPartNumbers] = useState<string[] | null>(null);
  const [loadingFitments, setLoadingFitments] = useState<boolean>(true);

  useEffect(() => {
    // If no vehicle is selected, skip fetching fitments
    if (!currentVehicle) {
      setFitPartNumbers(null);
      setLoadingFitments(false);
      return;
    }

    const { make_name, model_name, year, engine_base_name } = currentVehicle;

    async function fetchFitments() {
      setLoadingFitments(true);
      try {
        const params = new URLSearchParams({
          make_name,
          model_name,
          year,
          engine_base_name,
        });
        const res = await fetch(`/api/fitments?${params.toString()}`);
        if (!res.ok) {
          console.error(`Fitments API returned ${res.status}`);
          setFitPartNumbers([]);
          setLoadingFitments(false);
          return;
        }
        const data: { part_numbers: string[] } = await res.json();
        console.log('data', data)
        setFitPartNumbers(data.part_numbers);
      } catch (err) {
        console.error("Error fetching fitments:", err);
        setFitPartNumbers([]);
      } finally {
        setLoadingFitments(false);
      }
    }

    fetchFitments();
  }, [currentVehicle]);

  useEffect(() => {
    console.log('fitPartNumbers', fitPartNumbers)
  }, [fitPartNumbers])

  // ─── 5) APPLY FITMENT FILTER + BRAND + SORT LOGIC ──────────────────────────────
  const filteredList = useMemo(() => {
    let temp: Product[] = [];

    // 5a) If still loading fitments, show nothing (or optionally show full list with a loader)
    if (loadingFitments) {
      return [];
    }

    // 5b) If no vehicle is selected, start with the full list
    if (!currentVehicle) {
      temp = [...list];
    } else {
      // 5c) Vehicle is selected: filter by fitPartNumbers
      if (!fitPartNumbers) {
        console.log('fitPartNumbers', fitPartNumbers)
        // Still waiting for fitPartNumbers (this case is handled by loadingFitments above)
        return [];
      }
      console.log('temp', temp)
      temp = list.filter((p) => fitPartNumbers.includes(p.partNumber));
    }

    // 5d) Dropdown brand filter:
    if (filterBrand !== "all") {
      temp = temp.filter((p) => p.brand === filterBrand);
    }

    // 5e) Any checked brand‐checkboxes?
    const activeChecks = Object.entries(checkedBrands)
      .filter(([, checked]) => checked)
      .map(([b]) => b);
    if (activeChecks.length > 0) {
      temp = temp.filter((p) => activeChecks.includes(p.brand));
    }

    // 5f) Sort
    if (sortBy === "priceLow") {
      temp = [...temp].sort(
        (a, b) => parseFloat(a.price.amount) - parseFloat(b.price.amount)
      );
    } else if (sortBy === "priceHigh") {
      temp = [...temp].sort(
        (a, b) => parseFloat(b.price.amount) - parseFloat(a.price.amount)
      );
    } else if (sortBy === "newest") {
      temp = [...temp].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    // else sortBy === 'bestSellers': preserve original server order

    return temp;
  }, [
    list,
    fitPartNumbers,
    loadingFitments,
    currentVehicle,
    filterBrand,
    checkedBrands,
    sortBy,
  ]);

  // ─── 6) RENDER ────────────────────────────────────────────────────────────────
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
      {/* Breadcrumbs + Title */}
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

      {/* Sidebar + Main Content */}
      <Grid
        container
        spacing={2}
        sx={{
          justifyContent: "center",
          maxWidth: "1500px",
          width: "100%",
          mx: "auto",
        }}
      >
        {/* Left: Filter Sidebar */}
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
              const countByBrand = (list.filter((p) => p.brand === brand) || []).length;
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

        {/* Right: Main Area */}
        <Grid size={{ xs: 12, md: 9 }}>
          {/* Sort & Dropdown Controls */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              mb: 2,
            }}
          >
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
                  <MenuItem value="bestSellers">Best Sellers</MenuItem>
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

            {loadingFitments ? (
              <Typography variant="subtitle1" sx={{ mt: { xs: 1, md: 0 } }}>
                Loading…
              </Typography>
            ) : (
              <Typography variant="subtitle1" sx={{ mt: { xs: 1, md: 0 } }}>
                {filteredList.length} Results
              </Typography>
            )}
          </Box>

          {/* Product Cards */}
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