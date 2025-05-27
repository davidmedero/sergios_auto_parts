'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import BreadcrumbsNav from './BreadcrumbsNav';
import type { CatNode } from '@/lib/categories';

interface Props {
  title:    string;
  segments: string[];   // for breadcrumbs
  names:    string[];   // human-readable names for each segment
  items:    CatNode[];  // child categories to display
  basePath: string;     // e.g. "" or "/batteries"
}

export default function CategoryPage({
  title,
  segments,
  names,
  items,
  basePath,
}: Props) {
  return (
    <Box sx={{ p: 3 }}>
      {/* 1) Breadcrumbs in top-left */}
      <BreadcrumbsNav segments={segments} names={names} />

      {/* 2) Page title */}
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      {/* 3) Grid of child categories */}
      <Grid container spacing={2}>
        {items.map(item => (
          <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3 }}>
            <Card>
              <CardActionArea
                component={Link}
                href={`${basePath}/${item.handle}`}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 120,
                  }}
                >
                  {/* If you ever add images to categories, you can drop an <Image> here */}
                  <Typography
                    variant="subtitle1"
                    align="center"
                    noWrap
                  >
                    {item.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}