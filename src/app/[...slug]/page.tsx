// app/[...slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryTree, CatNode } from '@/lib/categories';

interface Props {
  params: { slug?: string[] };
}

export const revalidate = 60; // ISR

export default async function CategoryPage({ params }: Props) {
  // slug is an array of path segments; undefined on "/"
  const segments = params.slug ?? [];
  const tree: CatNode[] = await getCategoryTree();

  // Traverse the tree to find the current node
  let currentLevel = tree;
  let node: CatNode | undefined;
  for (const seg of segments) {
    node = currentLevel.find(n => n.handle === seg);
    if (!node) break;
    currentLevel = node.children;
  }

  // If we had segments but didn’t find a node → 404
  if (segments.length > 0 && !node) {
    notFound();
  }

  // What to display: children of the matched node, or top-level if none
  const itemsToShow = node ? node.children : tree;
  const title       = node ? node.name : 'All Categories';

  return (
    <main style={{ padding: 24 }}>
      <h1>{title}</h1>
      {itemsToShow.length === 0 ? (
        <p>No further sub-categories.</p>
      ) : (
        <ul>
          {itemsToShow.map(child => (
            <li key={child.id}>
              <Link href={`/${[...segments, child.handle].join('/')}`}>
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
