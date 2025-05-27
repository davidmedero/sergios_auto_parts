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

    variants: {
      edges: Array<{
        node: {
          price: Money;
        };
      }>;
    };
  } | null;
}