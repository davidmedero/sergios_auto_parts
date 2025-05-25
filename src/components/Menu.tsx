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
import useSWR from 'swr';
import { fetchCategoryTree } from '@/lib/getCategories';
import { CatNode } from '@/lib/categories';

interface MenuProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function Menu({ open, onOpen, onClose }: MenuProps) {
  const [openCat, setOpenCat] = useState<Record<string,boolean>>({});
  const [openSub, setOpenSub] = useState<Record<string,boolean>>({});

  const toggleCat = (id: string) =>
    setOpenCat(prev => ({ ...prev, [id]: !prev[id] }));

  const toggleSub = (id: string) =>
    setOpenSub(prev => ({ ...prev, [id]: !prev[id] }));

  const { data: menuData } = useSWR<CatNode[]>(
    'categories',       // key – SWR will cache under this
    fetchCategoryTree   // fetcher function
  );

  if (!menuData) return null;

  // iOS detection to disable swipe issues
  const iOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
    >
      <Box sx={{ width: 376 }}>
        {/* Header */}
        <Box sx={{ position: "relative", px: 2, py: "10px" }}>
          <Typography variant="h6">Menu</Typography>
          <IconButton
            edge="end"
            onClick={onClose}
            aria-label="close"
            sx={{ position: "absolute", right: 18, top: 6 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        <List disablePadding>
          {menuData.map(cat => (
            <React.Fragment key={cat.id}>
              {/* Level 1 */}
              <ListItemButton onClick={() => toggleCat(cat.id)}>
                <ListItemText 
                  primary={cat.name}
                  sx={{ 
                    "& .MuiTypography-root": {
                      fontWeight: 600
                    } 
                  }} 
                />
                {cat.children.length > 0 && (openCat[cat.id] ? <ExpandLess/> : <ExpandMore/>)}
              </ListItemButton>

              {/* Level 2 */}
              <Collapse in={openCat[cat.id]} unmountOnExit>
                <List component="div" disablePadding>
                  {cat.children.map(sub => (
                    <React.Fragment key={sub.id}>
                      <ListItemButton sx={{ pl: 4, borderBottom: sub.children.length > 0 && openSub[sub.id] ? "1px solid #EAEAEA" : "", bgcolor: sub.children.length > 0 && openSub[sub.id] ? "#F2F2F2" : "" }} onClick={() => toggleSub(sub.id)}>
                        <ListItemText 
                          primary={sub.name} 
                          sx={{ 
                            "& .MuiTypography-root": {
                              fontSize: "14px"
                            } 
                          }} 
                        />
                        {sub.children.length > 0 &&
                          (openSub[sub.id] ? <ExpandLess/> : <ExpandMore/>)}
                      </ListItemButton>

                      {/* Level 3 */}
                      <Collapse in={openSub[sub.id]} unmountOnExit>
                        <List component="div" disablePadding >
                          {sub.children.map(child => (
                            <ListItemButton sx={{ pl: 8 }} key={child.id}>
                              <ListItemText 
                                primary={child.name}
                                sx={{ 
                                  "& .MuiTypography-root": {
                                    fontSize: "14px"
                                  } 
                                }} 
                              />
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