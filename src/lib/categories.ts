import { storefront } from './shopify'

/** Raw field returned by the metaobject */
interface RawField {
  key:   string
  value: string | null           // for the "image" key this holds the MediaImage GID
}

/** One edge in the metaobjects(type:"category") connection */
interface CategoryNode {
  node: {
    id:     string
    handle: string
    fields: RawField[]
  }
}

/** Top‐level shape returned by our CATEGORY_QUERY */
interface CategoryEdges {
  categories: { edges: CategoryNode[] }
}

/** Our flattened category shape */
export interface Cat {
  id:        string
  handle:    string
  name:      string
  parentId:  string | null
  imageGid?: string          // the GID from the "image" field
  imageUrl?: string          // the final public URL
  imageAlt?: string | null   // optional alt text
}

/** A tree node with children */
export interface CatNode extends Cat {
  children: CatNode[]
}

/** 1) Fetch all category metaobjects (just fields) */
const CATEGORY_QUERY = `
  query AllCategories {
    categories: metaobjects(type: "category", first: 250) {
      edges {
        node {
          id
          handle
          fields {
            key
            value
          }
        }
      }
    }
  }
`

/** 2) Given a list of MediaImage GIDs, fetch their URLs + altText */
const MEDIA_QUERY = `
  query GetMediaImages($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on MediaImage {
        id
        image {
          url
          altText
        }
      }
    }
  }
`

/** Pull out the scalar fields + the raw image GID */
function parseRaw(edges: CategoryNode[]): Cat[] {
  return edges.map(({ node: { id, handle, fields } }) => {
    const lookup = (k: string) => fields.find(f => f.key === k)?.value ?? null

    const name      = lookup('name')!
    const parentVal = lookup('parent')
    const parentId  = parentVal ? (JSON.parse(parentVal) as string[])[0] : null
    const imageGid  = lookup('image') ?? undefined

    return { id, handle, name, parentId, imageGid }
  })
}

/** Batch‐fetch all MediaImage nodes by GID */
async function fetchImagesById(gids: string[]): Promise<Map<string,{url:string;altText:string|null}>> {
  if (gids.length === 0) return new Map()

  const { nodes } = await storefront<{
    nodes: Array<{ id: string; image: { url: string; altText: string | null } }>
  }>(MEDIA_QUERY, { ids: gids })

  return new Map(nodes.map(n => [n.id, n.image]))
}

/**
 * Fetch the flat list of categories, then:
 *  • parse out the image GIDs
 *  • batch-load the real image URLs
 *  • inject them back onto each Cat
 *  • assemble into a tree of CatNode
 */
export async function getCategoryTree(): Promise<CatNode[]> {
  // 1) fetch raw metaobjects
  const { categories } = await storefront<CategoryEdges>(CATEGORY_QUERY)

  // 2) flatten and extract image GIDs
  const flat = parseRaw(categories.edges)
  const imageGids = Array.from(
    new Set(flat.map(c => c.imageGid).filter((g): g is string => Boolean(g)))
  )

  // 3) fetch URL + altText for each GID
  const imageMap = await fetchImagesById(imageGids)

  // 4) stitch URLs back onto each flat Cat
  flat.forEach(cat => {
    if (cat.imageGid && imageMap.has(cat.imageGid)) {
      const img = imageMap.get(cat.imageGid)!
      cat.imageUrl = img.url
      cat.imageAlt = img.altText
    }
  })

  // 5) group by parentId
  const byParent = new Map<string|null, Cat[]>()
  flat.forEach(cat => {
    const arr = byParent.get(cat.parentId) ?? []
    arr.push(cat)
    byParent.set(cat.parentId, arr)
  })

  // 6) recursively build a tree
  function build(parentId: string|null): CatNode[] {
    return (byParent.get(parentId) || []).map(cat => ({
      ...cat,
      children: build(cat.id),
    }))
  }

  // top‐level nodes have parentId === null
  return build(null)
}