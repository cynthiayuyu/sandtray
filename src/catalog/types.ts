export type Category =
  | 'person'
  | 'animal'
  | 'plant'
  | 'building'
  | 'vehicle'
  | 'natural'
  | 'religious_mythical'
  | 'fantasy';

export const CATEGORY_ORDER: Category[] = [
  'person',
  'animal',
  'plant',
  'building',
  'vehicle',
  'natural',
  'religious_mythical',
  'fantasy',
];

export const CATEGORY_LABELS: Record<Category, string> = {
  person: '人物',
  animal: '動物',
  plant: '植物',
  building: '建築',
  vehicle: '交通工具',
  natural: '自然物',
  religious_mythical: '宗教／神話',
  fantasy: '幻想生物',
};

export type VisualSource =
  | { type: 'procedural'; builderKey: string }
  | { type: 'gltf'; url: string; scale?: number; yOffset?: number };

/**
 * 物件目錄項目：只含使用者可見的中繼資料。
 * 第二期的象徵意義註記絕不放在這裡，見 catalog/annotations.therapist-only.ts。
 */
export interface CatalogEntry {
  id: string;
  category: Category;
  label: string;
  keywords: string[];
  icon?: string;
  visualSource: VisualSource;
  defaultScale?: number;
  tags?: string[];
}
