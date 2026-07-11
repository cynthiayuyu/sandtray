import { catalogData } from './catalog.data';
import { CATEGORY_ORDER, type Category, type CatalogEntry } from './types';

export function entriesByCategory(category: Category): CatalogEntry[] {
  return catalogData.filter((e) => e.category === category);
}

export function categoriesWithEntries(): Category[] {
  return CATEGORY_ORDER.filter((c) => entriesByCategory(c).length > 0);
}

/** 簡易搜尋：比對 label 與 keywords，不分大小寫 */
export function searchCatalog(query: string): CatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalogData;
  return catalogData.filter(
    (e) => e.label.toLowerCase().includes(q) || e.keywords.some((k) => k.toLowerCase().includes(q)),
  );
}

export function findEntry(id: string): CatalogEntry | undefined {
  return catalogData.find((e) => e.id === id);
}
