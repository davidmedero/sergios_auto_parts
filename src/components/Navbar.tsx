"use client";

import React, { FC, useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Grid,
  Button,
  IconButton,
  Typography,
  ListItemButton,
  List,
  ListItemText,
  Collapse,
  SwipeableDrawer,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from "@mui/icons-material/Search";
import SelectedVehicleButton from "./SelectedVehicleButton";
import VehicleSelectorModal from "./VehicleSelectorModal";
import { useVehicles } from "@/contexts/VehiclesContext";
import { useRouter } from "next/navigation";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { FaCar } from "react-icons/fa";
import ProductSearch from "./ProductSearch";
import CloseIcon from '@mui/icons-material/Close';

const menuData = [
  {
    name: "Batteries, Starting and Charging",
    subcategories: [
      {
        name: "Alternators and Charging System",
        children: ["Alternator", "Voltage Regulator"],
      },
      { name: "Batteries", children: [] },
      /* … */
    ],
  },
  {
    name: "Drivetrain",
    subcategories: [
      { name: "Axle", children: [] },
      { name: "Transmission", children: [] },
      /* … */
    ],
  },
  // …add more categories here
];

const Navbar: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openCat, setOpenCat] = useState<Record<string, boolean>>({});
  const [openSub, setOpenSub] = useState<Record<string, boolean>>({});
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
                    p: 2,
                    ml: 1
                  },
                  "&:hover": {
                    bgcolor: "rgba(21, 101, 192, 0.1)"
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
                  sx={{ 
                    color: '#E25822',
                    letterSpacing: .5,
                    fontSize: 14,
                    "@media (max-width:480px)": {
                      fontSize: 12,
                      whiteSpace: "nowrap",
                      transform: "scaleX(0.8)",
                      transformOrigin: "left center",
                    },
                    "@media (max-width:350px)": {
                      fontSize: 11,
                    }
                  }}
                >
                  20% OFF ORDERS OVER $100* + FREE NEXT DAY DELIVERY^
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ 
                    color: 'text.secondary', 
                    display: 'block', 
                    mt: 0.25, 
                    fontSize: 12,
                    "@media (max-width:350px)": {
                      fontSize: 11,
                    },
                    "@media (max-width:330px)": {
                      fontSize: 10,
                    }
                  }}
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
      <AppBar position="sticky" elevation={2} sx={{ bgcolor: "#F2F2F2", top: 0 }}>
        <Toolbar 
          sx={{ 
            minHeight: 64, 
            pl: "24px"
          }}
        >
          <Grid container alignItems="center" spacing={2} sx={{ flexWrap: "nowrap", flexGrow: 1, flexShrink: 0, justifyContent: "space-between" }}>
            {/* Hamburger and Vehicle Selector Container */}
            <Grid container alignItems="center" sx={{ flexWrap: "nowrap", flexShrink: 0 }}>
              {/* Hamburger */}
              <Grid>
                <IconButton 
                  size="large" 
                  edge="start" 
                  sx={{ color: "#2d2a26" }}
                  onClick={() => setOpenDrawer(true)}
                >
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
                    sx={{ 
                      textTransform: "none",
                      border: "none",
                      bgcolor: "#FFF",
                      boxSizing: "border-box",
                      "&:hover": {
                        bgcolor: "rgba(21, 101, 192, 0.1)"
                      },
                      "@media (max-width:480px)": {
                        bgcolor: 'transparent',
                      },
                    }}
                  >
                    <Grid container alignItems="center" spacing={1}>
                      <FaCar size="1.5rem" color="#2d2a26" style={{ width: "30px" }} />
                      <Typography
                        variant="body2"
                        sx={{ 
                          color: "#2d2a26",
                          "@media (max-width:480px)": {
                            display: 'none',
                          } 
                        }}
                      >
                        Add Vehicle
                      </Typography>
                      <ChevronRightIcon 
                        sx={{ 
                          color: "#2d2a26",
                          "@media (max-width:480px)": {
                            display: 'none',
                          } 
                        }}
                      />
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
                  width: '100%',
                  '@media (max-width:700px)': { display: 'none' },
                }}
              >
                <ProductSearch />
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
                  onClick={() => setMobileSearchOpen((o) => !o)}
                >
                  <SearchIcon />
                </IconButton>
                <IconButton sx={{ color: "#2d2a26" }}>
                  <PersonIcon />
                </IconButton>
                <IconButton sx={{ color: "#2d2a26" }}>
                  <ShoppingCartIcon />
                </IconButton>
              </Box>
            </Grid>
            
          </Grid>
        </Toolbar>
        {/* mobile search input */}
        <Collapse
          in={mobileSearchOpen}
          timeout={300}
          sx={{
            '@media (min-width:701px)': { display: 'none' },
            bgcolor: '#FFF',
          }}
          unmountOnExit
        >
          <Box sx={{ p: 1 }}>
            <ProductSearch />
          </Box>
        </Collapse>
      </AppBar>

      {/* Vehicle Selector Modal */}
      <VehicleSelectorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <SwipeableDrawer
        anchor="left"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        onOpen={() => setOpenDrawer(true)}
      >
        <Box sx={{ width: 376 }}>
          {/* Drawer Header */}
          <Box sx={{ position: "relative", px: 2, py: "10px" }}>
            <Typography variant="h6">Menu</Typography>
            <IconButton
              edge="end"
              onClick={() => setOpenDrawer(false)}
              aria-label="close"
              sx={{ position: "absolute", right: 18, top: 6 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          
          <List>
            {menuData.map((cat) => (
              <React.Fragment key={cat.name}>
                <ListItemButton
                  onClick={() =>
                    setOpenCat((prev) => ({
                      ...prev,
                      [cat.name]: !prev[cat.name],
                    }))
                  }
                >
                  <ListItemText primary={cat.name} />
                  {openCat[cat.name] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openCat[cat.name]} unmountOnExit>
                  <List component="div" disablePadding>
                    {cat.subcategories.map((sub) => (
                      <React.Fragment key={sub.name}>
                        <ListItemButton
                          sx={{ pl: 4 }}
                          onClick={() =>
                            setOpenSub((prev) => ({
                              ...prev,
                              [sub.name]: !prev[sub.name],
                            }))
                          }
                        >
                          <ListItemText primary={sub.name} />
                          {sub.children.length > 0 &&
                            (openSub[sub.name] ? (
                              <ExpandLess />
                            ) : (
                              <ExpandMore />
                            ))}
                        </ListItemButton>
                        <Collapse in={openSub[sub.name]} unmountOnExit>
                          <List component="div" disablePadding>
                            {sub.children.map((child) => (
                              <ListItemButton sx={{ pl: 8 }} key={child}>
                                <ListItemText primary={child} />
                              </ListItemButton>
                            ))}
                          </List>
                        </Collapse>
                      </React.Fragment>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>
    </>
  );
};

export default Navbar;