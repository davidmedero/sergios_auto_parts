'use client';

import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { ProductByHandleQuery } from '@/lib/types';
import ProductImages from './ProductImages';
import ProductInfo   from './ProductInfo';
import FadeInSection from '@/hooks/FadeInSection';
import ProductSpecs from './ProductSpecs';

interface Props {
  product: NonNullable<ProductByHandleQuery['productByHandle']>;
}

const ProductPage: FC<Props> = ({ product }) => {
  const { title, handle, images, descriptionHtml, imagesJson, variants, partNumber, specs } = product;

  // extract URLs from the MediaImage references
  const urls = imagesJson?.references.nodes
    .filter(n => n.__typename === 'MediaImage')
    .map(n => n.image.url) ?? [];

  const id = product.variants.edges[0]?.node.id;
  const price = variants.edges[0]?.node.price.amount;
  const sku = variants.edges[0]?.node.sku;
  const image = images.edges[0].node.url;

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
            id={id}
            title={title}
            handle={handle}
            image={image}
            price={price}
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