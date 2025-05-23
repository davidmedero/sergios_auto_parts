import React, { useState } from "react";
import {
  SwipeableDrawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

// --- Menu data ---
const menuData = [
  {
    name: "Batteries, Starting and Charging",
    subcategories: [
      {
        name: "Alternators and Charging System",
        children: [
          "Alternator",
          "Voltage Regulator",
          "Battery Cable",
          "Starter Motor",
        ],
      },
      { name: "Batteries", children: ["Lead Acid Battery", "AGM Battery"] },
      { name: "Battery Cables and Accessories", children: [] },
      { name: "Switches, Relays and Sensors", children: [] },
    ],
  },
  {
    name: "Drivetrain",
    subcategories: [
      { name: "Axle", children: [] },
      { name: "CV Joint & Boot", children: [] },
      { name: "Transmission", children: ["Transmission Mount", "Torque Converter"] },
      { name: "Differential", children: [] },
    ],
  },
  {
    name: "Brakes",
    subcategories: [
      { name: "Brake Pads & Shoes", children: [] },
      { name: "Rotors & Drums", children: [] },
      { name: "Calipers & Hardware", children: [] },
      { name: "Brake Lines & Hoses", children: [] },
    ],
  },
];

interface MenuProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function Menu({ open, onOpen, onClose }: MenuProps) {
  const [openCat, setOpenCat] = useState<Record<string, boolean>>({});
  const [openSub, setOpenSub] = useState<Record<string, boolean>>({});

  // iOS detection to disable swipe issues
  const iOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
    >
      <Box sx={{ width: 376 }}>
        {/* Header */}
        <Box sx={{ position: 'relative', px: 2, py: '10px' }}>
          <Typography variant="h6">Menu</Typography>
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label="close"
            sx={{ position: 'absolute', right: 18, top: 6 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {/* Nested list */}
        <List disablePadding>
          {menuData.map((cat) => (
            <React.Fragment key={cat.name}>
              <ListItemButton
                onClick={() =>
                  setOpenCat((prev) => ({ ...prev, [cat.name]: !prev[cat.name] }))
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
                          setOpenSub((prev) => ({ ...prev, [sub.name]: !prev[sub.name] }))
                        }
                      >
                        <ListItemText primary={sub.name} />
                        {sub.children.length > 0 &&
                          (openSub[sub.name] ? <ExpandLess /> : <ExpandMore />)}
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
  );
}