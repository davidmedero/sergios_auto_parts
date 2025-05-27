'use client';

import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from 'next/link';
import Typography from '@mui/material/Typography';

interface Props {
  segments: string[];
  names: string[];
}

export default function BreadcrumbsNav({ segments, names }: Props) {
  const crumbs = [{ href: '/', label: 'Home' }].concat(
    segments.map((_, i) => ({
      href: '/' + segments.slice(0, i + 1).join('/'),
      label: names[i],
    }))
  );

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      {crumbs.map((c, i) =>
        i < crumbs.length - 1 ? (
          <Link key={c.href} href={c.href} style={{ textDecoration: 'none' }}>
            {c.label}
          </Link>
        ) : (
          <Typography key={c.href} color="text.primary">
            {c.label}
          </Typography>
        )
      )}
    </Breadcrumbs>
  );
}