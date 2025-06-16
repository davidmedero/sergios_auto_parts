import HomeClient from '@/components/HomeClient';
import { getCategoryTree, CatNode } from '@/lib/categories';

export const dynamic = 'force-static'
export const revalidate = false

export default async function HomePage() {

  const categoryTree: CatNode[] = await getCategoryTree();

  const topCategories = categoryTree;

  return <HomeClient categories={topCategories} />;
}