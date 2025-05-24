interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

const STOREFRONT_API_URL = process.env.NEXT_PUBLIC_STOREFRONT_API_URL!;
const STOREFRONT_TOKEN   = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

/**
 * Generic helper to perform Storefront GraphQL queries.
 * @param query - GraphQL query string
 * @param variables - an object of variables (keys and values)
 * @returns the `data` field from the GraphQL response
 */
export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(STOREFRONT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Shopify error ${res.status}: ${res.statusText}`);
  }

  const responseBody = (await res.json()) as GraphQLResponse<T>;

  if (responseBody.errors && responseBody.errors.length > 0) {
    const allMessages = responseBody.errors.map(err => err.message).join('\n');
    throw new Error(allMessages);
  }

  return responseBody.data;
}