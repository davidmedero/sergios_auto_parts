import { getCategoryTree, CatNode } from './categories';

export const fetchCategoryTree = (): Promise<CatNode[]> => {
  return getCategoryTree();
};