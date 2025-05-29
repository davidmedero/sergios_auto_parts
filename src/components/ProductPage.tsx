'use client';

import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { ProductByHandleQuery, Money } from '@/lib/types';
import ProductImages from './ProductImages';
import ProductInfo   from './ProductInfo';
import FadeInSection from '@/hooks/FadeInSection';
import ProductSpecs from './ProductSpecs';

interface Props {
  product: NonNullable<ProductByHandleQuery['productByHandle']>;
}

const ProductPage: FC<Props> = ({ product }) => {
  const { title, descriptionHtml, imagesJson, variants, partNumber, specs } = product;

  // extract URLs from the MediaImage references
  const urls = imagesJson?.references.nodes
    .filter(n => n.__typename === 'MediaImage')
    .map(n => n.image.url) ?? [];

  const priceNode = variants.edges[0]?.node.price as Money | undefined;
  const sku = variants.edges[0]?.node.sku;

  return (
    <>
      <FadeInSection>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            '@media (max-width: 980px)': {
              flexDirection: 'column',
              alignItems: 'center',
            },
            mx: 'auto'
          }}
        >
          <ProductImages urls={urls} />
          <ProductInfo
            title={title}
            price={priceNode}
            sku={sku}
            partNumber={partNumber}
          />
        </Box>
      </FadeInSection>

      <FadeInSection>
        <ProductSpecs
          descriptionHtml={descriptionHtml}
          specs={specs}
        />
      </FadeInSection>
    </>
  );
};

export default ProductPage;