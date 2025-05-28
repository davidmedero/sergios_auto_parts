export interface Money {
  amount:       string;
  currencyCode: string;
}

export interface ProductByHandleQuery {
  productByHandle: {
    id:          string;
    title:       string;
    description: string;
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
          price: Money;
          sku: string;
        };
      }>;
    };
  } | null;
}