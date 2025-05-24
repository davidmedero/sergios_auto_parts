import { storefront } from './shopify';

export interface Cat {
  id:       string;
  name:     string;
  parentId: string | null;
}

export interface CatNode extends Cat {
  children: CatNode[];
}

interface Field {
  key:   string;
  value: string | null;
}

interface CategoryNode {
  node: {
    id:     string;
    fields: Field[];
  };
}

interface CategoryEdges {
  categories: { edges: CategoryNode[] };
}

const CATEGORY_QUERY = `
  query AllCategories {
    categories: metaobjects(type: "category", first: 250) {
      edges {
        node {
          id
          fields {
            key
            value
          }
        }
      }
    }
  }
`;

/**
 * Convert raw GraphQL edges into flat Cat[]
 */
function parseRaw(edges: CategoryNode[]): Cat[] {
  return edges.map(({ node: { id, fields } }) => {
    const lookup = (key: string) => fields.find(f => f.key === key)?.value ?? null;

    // the "parent" field is stored as a JSON-stringified array of GIDs
    const parentValue = lookup('parent');
    const parentId    = parentValue
      ? (JSON.parse(parentValue) as string[])[0]
      : null;

    return {
      id,
      name:     lookup('name')!,
      parentId,
    };
  });
}

/**
 * Fetch the flat list, then assemble a tree of CatNode
 */
export async function getCategoryTree(): Promise<CatNode[]> {
  const data = await storefront<CategoryEdges>(CATEGORY_QUERY);
  const cats = parseRaw(data.categories.edges);

  // group by parentId
  const byParent = new Map<string|null, Cat[]>();
  cats.forEach(cat => {
    const list = byParent.get(cat.parentId) ?? [];
    list.push(cat);
    byParent.set(cat.parentId, list);
  });

  // recursively build the tree
  function build(parentId: string|null): CatNode[] {
    return (byParent.get(parentId) || []).map(cat => ({
      ...cat,
      children: build(cat.id),
    }));
  }

  // top-level entries are those with parentId === null
  return build(null);
}