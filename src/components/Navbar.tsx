"use client";

import React, { FC, useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Grid,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SelectedVehicleButton from "./SelectedVehicleButton";
import VehicleSelectorModal from "./VehicleSelectorModal";
import { useVehicles } from "@/contexts/VehiclesContext";
import { useRouter } from "next/navigation";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { FaCar } from "react-icons/fa";


const Navbar: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { vehicles, currentVehicleId } = useVehicles();
  const currentVehicle = vehicles.find(v => v.id === currentVehicleId) || null;
  const router = useRouter();

  return (
    <>
      {/* Top Row */}
      <AppBar 
        position="static"
        elevation={0}
        sx={{ 
          bgcolor: "#FFF",
          "@media (max-width:768px)": {
            width: "100%",
          } 
        }}
      >
        <Toolbar 
          sx={{
            pl: '20px !important',
            minHeight: 48,
            "@media (max-width:768px)": {
              p: '0px !important',
            }  
          }}
        >
          <Grid 
            container 
            alignItems="center" 
            justifyContent="space-between" 
            sx={{ width: "100%" }}
          >
            <Grid 
              container 
              alignItems="center" 
              spacing={2} 
              sx={{ 
                "@media (max-width:768px)": {
                  flexDirection: "column-reverse",
                  alignItems: "flex-start",
                  width: "100%",
                  '--Grid-rowSpacing': 0
                }
              }}
            >
              <Button 
                onClick={() => router.push("/")}
                sx={{ 
                  textTransform: "none",
                  "@media (max-width:768px)": {
                    p: 2
                  }
                }}
              >
                <Typography variant="h1" fontSize={24} fontWeight={500} color="#2d2a26">
                  Sergios Auto Parts
                </Typography>
              </Button>

              {/* left slash */}
              <Grid>
                <Box
                  component="span"
                  sx={{
                    content: '""',
                    position: 'absolute',
                    height: '35px',
                    fontSize: '40px',
                    top: '16px',
                    bgcolor: '#e6e6e6',
                    width: '1px',
                    transform: 'rotate(25deg)',
                    "@media (max-width:768px)": {
                      display: "none"
                    }
                  }}
                />
              </Grid>

              {/* promo text */}
              <Grid 
                sx={{ 
                  ml: 2,
                  "@media (max-width:768px)": {
                    ml: "0",
                    width: "100%",
                    bgcolor: "#F2F2F2",
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    py: 1,
                    px: 2
                  }
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  sx={{ color: '#E25822', letterSpacing: .5, fontSize: 14 }}
                >
                  20% OFF ORDERS OVER $100* + FREE NEXT DAY DELIVERY^
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mt: 0.25, fontSize: 12 }}
                >
                  Eligible Ship-To-Home Items Only. Use Code: DIYSPECIAL
                </Typography>
              </Grid>

              {/* right slash */}
              <Grid>
                <Box
                  component="span"
                  sx={{
                    content: '""',
                    position: 'absolute',
                    height: '35px',
                    fontSize: '40px',
                    top: '16px',
                    bgcolor: '#e6e6e6',
                    width: '1px',
                    transform: 'rotate(25deg)',
                    "@media (max-width:768px)": {
                      display: "none"
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      {/* Bottom Row */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#F2F2F2", top: 0 }}>
        <Toolbar 
          sx={{ 
            minHeight: 64, 
            "@media (max-width:768px)": {
              px: '16px !important',
            }   
          }}
        >
          <Grid container alignItems="center" spacing={2} sx={{ flexWrap: "nowrap", flexGrow: 1, flexShrink: 0, justifyContent: "space-between" }}>
            {/* Hamburger and Vehicle Selector Container */}
            <Grid container alignItems="center" sx={{ flexWrap: "nowrap", flexShrink: 0 }}>
              {/* Hamburger */}
              <Grid>
                <IconButton size="large" edge="start" sx={{ color: "#2d2a26" }}>
                  <MenuIcon />
                </IconButton>
              </Grid>

              {/* Vehicle selector */}
              <Grid>
                {currentVehicle ? (
                  <SelectedVehicleButton
                    vehicleLabel={currentVehicle.label}
                    onClick={() => setModalOpen(true)}
                  />
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => setModalOpen(true)}
                    sx={{ textTransform: "none", bgcolor: "#FFF", border: "none" }}
                  >
                    <Grid container alignItems="center" spacing={1}>
                      <FaCar size="1.5rem" color="#2d2a26" style={{ width: "30px" }} />
                      <Typography variant="body2" sx={{ color: "#2d2a26" }}>Add Vehicle</Typography>
                      <ChevronRightIcon color="action" />
                    </Grid>
                  </Button>
                )}
              </Grid>
            </Grid>

            {/* Search bar and Manage Vehicles Container */}
            <Grid container alignItems="center" sx={{ width: "100%", flexWrap: "nowrap", flexGrow: 1 }}>
              {/* Search bar */}
              <Grid 
                sx={{
                  width: "100%",
                  "@media (max-width:700px)": {
                    display: 'none',
                  } 
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Find Parts and Products"
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    bgcolor: "#FFF"
                  }}
                />
              </Grid>

              <Box 
                sx={{ 
                  display: "inline-flex",
                  flexWrap: "nowrap",
                  gap: 1,
                  "@media (max-width:700px)": {
                    width: "100%",
                    justifyContent: "flex-end"
                  }  
                }}
              >
                <IconButton 
                  sx={{ 
                    color: "#2d2a26",
                    display: "none",
                    "@media (max-width:700px)": {
                      display: 'flex',
                    } 
                  }}
                >
                  <SearchIcon />
                </IconButton>
                <IconButton sx={{ color: "#2d2a26" }}>
                  <PersonOutlineIcon />
                </IconButton>
                <IconButton sx={{ color: "#2d2a26" }}>
                  <ShoppingCartOutlinedIcon />
                </IconButton>
              </Box>
            </Grid>
            
          </Grid>
        </Toolbar>
      </AppBar>

      {/* Vehicle Selector Modal */}
      <VehicleSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default Navbar;