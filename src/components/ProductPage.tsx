'use client';

import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { ProductByHandleQuery, Money } from '@/lib/types';
import ProductImages from './ProductImages';
import ProductInfo   from './ProductInfo';
import FadeInSection from '@/hooks/FadeInSection';

interface Props {
  product: NonNullable<ProductByHandleQuery['productByHandle']>;
}

const ProductPage: FC<Props> = ({ product }) => {
  const { title, description, imagesJson, variants } = product;

  // extract URLs from the MediaImage references
  const urls = imagesJson?.references.nodes
    .filter(n => n.__typename === 'MediaImage')
    .map(n => n.image.url) ?? [];

  const priceNode = variants.edges[0]?.node.price as Money | undefined;

  return (
    <FadeInSection>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          pl: 3,
          '@media (max-width: 980px)': {
            flexDirection: 'column',
            alignItems: 'center',
            pl: 0,
          },
          gap: 3,
          mx: 'auto'
        }}
      >
        <ProductImages urls={urls} />
        <ProductInfo
          title={title}
          description={description}
          price={priceNode}
        />
      </Box>
    </FadeInSection>
  );
};

export default ProductPage;