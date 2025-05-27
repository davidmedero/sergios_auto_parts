import { GraphQLClient, gql } from 'graphql-request';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const client = new GraphQLClient(
  `https://${process.env.SHOPIFY_MYSHOPIFY_DOMAIN}/admin/api/2025-01/graphql.json`,
  { headers: { 'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN! } }
);

// 1) Fetch all Category metaobjects
const FETCH_CATS = gql`
  query FetchCategories {
    categories: metaobjects(type: "category", first: 250) {
      edges { node { handle fields { key value } } }
    }
  }
`;
interface FetchCatsResponse {
  categories: { edges: Array<{ node: { handle: string; fields: { key: string; value: string|null }[] } }> };
}

// 2) Upsert a Custom Collection
const UPSERT_COLLECTION = gql`
  mutation UpsertCollection($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id handle }
      userErrors { field message }
    }
  }
`;
interface UpsertCollectionResponse {
  collectionCreate: {
    collection: { id: string; handle: string };
    userErrors: Array<{ field: string[]; message: string }>;
  };
}

async function run() {
  const { categories } = await client.request<FetchCatsResponse>(FETCH_CATS);

  for (const { node } of categories.edges) {
    const handle = node.handle;
    const title  = node.fields.find(f => f.key === 'name')?.value ?? handle;

    try {
      const up = await client.request<UpsertCollectionResponse>(
        UPSERT_COLLECTION,
        { input: { handle, title } }
      );
      if (up.collectionCreate.userErrors.length) {
        console.error('✖ collectionCreate errors:', up.collectionCreate.userErrors);
      } else {
        console.log(`✔ Collection "${handle}" → ${up.collectionCreate.collection.id}`);
      }
    } catch (err) {
      console.error('‼ Error creating collection:', err);
    }
  }

  console.log('🎉 All done – Collections are in sync!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});