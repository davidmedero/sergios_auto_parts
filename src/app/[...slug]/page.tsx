import { notFound } from 'next/navigation';
import { storefront } from '@/lib/shopify';
import { getCategoryTree, type CatNode } from '@/lib/categories';
import type { ProductByHandleQuery } from '@/lib/types';
import ProductPage      from '@/components/ProductPage';
import CategoryPage     from '@/components/CategoryPage';
import ProductListPage  from '@/components/ProductListPage';

export const revalidate = 60;

// 1) Single‐product query
const PRODUCT_QUERY = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      images(first: 1) {
        edges {
          node {
            url
            altText
            id
          }
        }
      }
      imagesJson: metafield(namespace: "custom", key: "images") {
        references(first: 10) {
          nodes {
            __typename
            ... on MediaImage {
              image {
                url
              }
            }
          }
        }
      }

      partNumber: metafield(namespace: "custom", key: "part_number") {
        value
      }

      specs: metafield(namespace: "custom", key: "specifications") {
        value
      }

      variants(first: 1) {
        edges {
          node {
            id
            price { amount currencyCode }
            sku
          }
        }
      }
    }
  }
`;

// 2) Fetch products via a Shopify Collection → Products connection
const COLLECTION_PRODUCTS_QUERY = `
  query ProductsByCollection(
    $handle: String!
    $first: Int!
    $after: String
  ) {
    collection(handle: $handle) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            handle
            title
            createdAt
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            partNumber: metafield(namespace: "custom", key: "part_number") {
              value
            }
            notes: metafield(namespace: "custom", key: "notes") {
              value
            }
            brand: metafield(namespace: "custom", key: "brand") {
              value
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  sku
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function CatchAllPage({ params }: any) {
  const segments = params.slug ?? [];

  // — A) PRODUCT DETAIL — if exactly one segment, try loading as product
  if (segments.length === 1) {
    const handle = segments[0];
    const { productByHandle } = await storefront<ProductByHandleQuery>(
      PRODUCT_QUERY,
      { handle }
    );
    if (productByHandle) {
      return <ProductPage product={productByHandle} />;
    }
    // otherwise fall through to category logic
  }

  // — B) CATEGORY TREE NAVIGATION —
  const tree: CatNode[] = await getCategoryTree();
  let node: CatNode | undefined;
  let currentLevel = tree;
  for (const seg of segments) {
    node = currentLevel.find(n => n.handle === seg);
    if (!node) break;
    currentLevel = node.children;
  }

  // no match → 404
  if (segments.length > 0 && !node) {
    return notFound();
  }

  // Determine breadcrumbs names
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const names = segments.map((_: any, i: number) => {
    let lvl = tree;
    let found: CatNode | undefined;
    for (let j = 0; j <= i; j++) {
      found = lvl.find(n => n.handle === segments[j]);
      lvl = found?.children ?? [];
    }
    return found!.name;
  });

  // — C) CATEGORY OR SUBCATEGORY — has children?
  const children = node ? node.children : tree;
  if (children.length > 0) {
    const title    = node ? node.name : 'All Categories';
    const basePath = segments.length > 0 ? `/${segments.join('/')}` : '';
    return (
      <CategoryPage
        title={title}
        segments={segments}
        names={names}
        items={children}
        basePath={basePath}
      />
    );
  }

  // — D) LEAF CATEGORY → PRODUCT LIST via Collection —
  const categoryHandle = node!.handle;

  // Fetch first page of products; omit pagination for simplicity
  const { collection } = await storefront<{
    collection: {
      products: {
        edges: Array<{
          node: {
            id: string;
            handle: string;
            title: string;
            images: { edges: Array<{ node: { url: string; altText: string | null; width: number; height: number } }> };
            partNumber: { value: string };
            variants: { edges: Array<{ node: { id: string, sku: string, price: { amount: string; currencyCode: string } } }> };
            notes: { value: string };
            variantId: string;
            brand: { value: string };
            createdAt: string;
          };
        }>;
      };
    };
  }>(
    COLLECTION_PRODUCTS_QUERY,
    {
      handle: categoryHandle,
      first: 50,
      after: null
    }
  );

  // Map into ProductListPage props
  const list = collection.products.edges.map(({ node: p }) => ({
    id:       p.id,
    handle:   p.handle,
    title:    p.title,
    imageUrl: p.images.edges[0]?.node.url ?? '',
    altText:  p.images.edges[0]?.node.altText  ?? '',
    partNumber: p.partNumber.value,
    sku: p.variants.edges[0]?.node.sku,
    price: {
      amount:       p.variants.edges[0]?.node.price.amount  ?? '0.00',
      currencyCode: p.variants.edges[0]?.node.price.currencyCode,
    },
    notes: p.notes.value,
    variantId: p.variants.edges[0]?.node.id,
    brand: p.brand.value,
    createdAt: p.createdAt
  }));

  const title    = node!.name;

  return (
    <ProductListPage
      title={title}
      segments={segments}
      names={names}
      list={list}
    />
  );
}