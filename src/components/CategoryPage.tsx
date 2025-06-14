'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  segments: string[];
  names:    string[];
  items:    CatNode[];
  basePath: string;
}

export default function CategoryPage({
  title,
  segments,
  names,
  items,
  basePath,
}: Props) {
  const router = useRouter();

  return (
    <Box sx={{ p: 3 }}>
      <BreadcrumbsNav segments={segments} names={names} />

      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>

      <Grid container spacing={2}>
        {items.map(item => {
          const href = `${basePath}/${item.handle}`;

          return (
            <Grid key={item.id} size={{ xs: 6, sm: 4, md: 3 }}>
              {/* Link with prefetch wraps the whole card */}
              <Link href={href} prefetch>
                <Card>
                  <CardActionArea
                    // also prefetch on hover
                    onMouseEnter={() => router.prefetch(href)}
                    component="div"
                  >
                    <CardContent
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 120,
                      }}
                    >
                      <Typography variant="subtitle1" align="center" noWrap>
                        {item.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Link>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}