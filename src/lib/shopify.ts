// ——— Storefront API URL & token —————————
export const STOREFRONT_API_URL = process.env.NEXT_PUBLIC_STOREFRONT_API_URL!;
export const STOREFRONT_TOKEN     = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

// ——— 1) cartCreate: make a brand-new Cart —————————
export const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    handle
                    title
                  }
                  price {
                    amount
                    currencyCode
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
        estimatedCost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    handle
                    title
                  }
                  price {
                    amount
                    currencyCode
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
        estimatedCost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    handle
                    title
                  }
                  price {
                    amount
                    currencyCode
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
        estimatedCost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    handle
                    title
                  }
                  price {
                    amount
                    currencyCode
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
        estimatedCost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// … plus your `storefront<T>(…)` helper, and the CartPayload & CartLine types, etc.


// ——— 5) Basic types for our responses ————————————————————————
export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: { handle: string; title: string };
    price: { amount: string; currencyCode: string };
    image: { url: string; altText: string | null } | null;
  };
}

export interface CartPayload {
  cart: {
    id: string;
    checkoutUrl: string;
    lines: {
      edges: Array<{ node: CartLine }>;
    };
    estimatedCost: {
      totalAmount: {
        amount: string;
        currencyCode: string;
      };
    };
  };
  userErrors: Array<{ field: string[]; message: string }>;
}

/** A generic wrapper for a Storefront query/mutation response */
interface GraphQLResponse<T> {
  data:    T;
  errors?:  Array<{ message: string; path?: string[] }>;
}

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