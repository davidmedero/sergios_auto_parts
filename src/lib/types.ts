/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductByHandleQuery {
  productByHandle: {
    id:          string;
    title:       string;
    handle: string;
    descriptionHtml: string;
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string;
          id: string;
        }
      }>
    }
    imagesJson: {
      references: {
        nodes: Array<{
          __typename: string;
          image: { url: string };
        }>;
      };
    } | null;
    partNumber: {
      value: string
    };
    specs: {
      value: string
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          price: Money;
          sku: string;
        };
      }>;
    };
  } | null;
}

export interface CartItem {
  id: string;
  title: string;
  handle: string;
  image: string;
  price: string;
  quantity: number;
};

export interface CartProps {
  cart: CartItem[];
};

export interface LineItem {
  id: string;
  quantity: number;
  title: string;
};

export interface Checkout {
  id: string;
  webUrl: string;
  buyerIdentity: {
    countryCode: string;
  };
  totalPriceV2: {
    amount: number;
    currencyCode: string;
  };
  lineItems: {
    edges: {
      node: CheckoutLineItem;
    }[];
  };
};

export interface CheckoutLineItem {
  id: string;
  title: string;
  quantity: number;
};

export interface CheckoutCreateResponse {
  data: {
    checkoutCreate: {
      checkout: Checkout;
    };
  };
  errors?: any[];
};

export interface CheckoutLineItemsReplaceResponse {
  data: {
    checkoutLineItemsReplace: {
      checkout: Checkout;
    };
  };
  errors?: any[];
};