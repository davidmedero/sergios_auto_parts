/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

interface SpecRow {
  label: string;
  value: string;
}

interface Props {
  specs: { value: string };
  description: string;
}

type TextNode = { type: 'text'; value: string }
type ParagraphNode = { type: 'paragraph'; children: TextNode[] }

export default function ProductSpecs({
  specs,
  description
}: Props) {
  const rows = React.useMemo<SpecRow[]>(() => {
    if (!specs) return []

    // 1) find all paragraph children
    const paras = JSON.parse(specs.value).children.filter(
      (n: { type: string }): n is ParagraphNode => n.type === 'paragraph'
    )

    // 2) flatten all their text nodes into one big string
    const fullText = paras
      .map((p: { children: any[] }) =>
        p.children
         .map((child: { value: any }) => child.value)
         .join('')
      )
      .join('') // in case there are multiple paragraphs

    // 3) split on the double-newline markers
    const lines = fullText
      .split(/\n{2,}/)
      .map((l: string) => l.trim())
      .filter((l: string | any[]) => l.length > 0)

    // 4) split each on the first colon
    return lines.map((line: string) => {
      const idx = line.indexOf(':')
      if (idx === -1) return { label: line, value: '' }
      return {
        label: line.slice(0, idx).trim(),
        value: line.slice(idx + 1).trim()
      }
    })
  }, [specs])

  return (
    <Grid container spacing={4} sx={{ mt: 4, px: 3, mb: 5, flexWrap: 'nowrap', justifyContent: 'center', width: '100%', '@media (max-width: 1100px)': {
      flexDirection: 'column',
    }, '@media (max-width: 664px)': {
      px: 0
    } }}>
      {/* Left: specs table */}
      <Grid 
        sx={{ 
          maxWidth: '910px',
          width: '100%',
          '@media (max-width: 1100px)': {
            maxWidth: '100%'
          } 
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            '@media (max-width: 664px)': {
              px: 2
            } 
          }}
        >
          Product Specifications
        </Typography>

        {rows.length > 0 ? (
          rows.map((row, i) => (
            <Stack
              key={i}
              sx={{
                px: 2,
                py: 2,
                flexDirection: 'row',
                backgroundColor: i % 2 ? 'grey.100' : 'transparent',
                '@media (max-width: 500px)': {
                  flexDirection: 'column',
                  gap: 1
                }
              }}
            >
              <Box sx={{ width: '350px', '@media (max-width: 720px)': {
                width: 'calc(54% - 50px)'
              } }}>
                <Typography
                  variant="body1"
                  fontSize='16px'
                  sx={{ flex: 1, fontWeight: 500, color: 'text.primary' }}
                >
                  {row.label}
                </Typography>
              </Box>
              
              <Typography
                variant="body1"
                sx={{ flex: 1, color: 'text.primary', fontWeight: row.label !== 'Notes' ? 600 : 500, fontStyle: row.label === 'Notes' ? 'italic' : 'normal', fontSize: row.label === 'Notes' ? '14px' : '16px' }}
              >
                {row.value}
              </Typography>
            </Stack>
          ))
        ) : (
          <Typography
            variant="body1"
            fontSize='16px'
            color="text.secondary"
            sx={{ px: 2, py: 1 }}
          >
            No specifications available.
          </Typography>
        )}
      </Grid>

      {/* Right: product description (raw HTML) */}
      <Grid 
        sx={{ 
          maxWidth: '650px',
          width: '56%',
          '@media (max-width: 1100px)': {
            width: '100%',
            maxWidth: '100%',
          },
          '@media (max-width: 664px)': {
          px: 2,
        }
        }}
      >
        <Typography variant="h6" gutterBottom>
          Product Description
        </Typography>
        <Box>
          <Typography variant="body1" fontSize='16px' dangerouslySetInnerHTML={{ __html: description }}></Typography>
        </Box>  
      </Grid>
    </Grid>
  )
}