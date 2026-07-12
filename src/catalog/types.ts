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
  | {
      type: 'gltf';
      url: string;
      /**
       * 模型「最長邊」要正規化到的公分數。外部素材包的原始尺度差異極大（有的以公尺、
       * 有的以任意單位建模），用固定 scale 逐一手調很難維持一致；改成載入後量測
       * bounding box、自動縮放到 targetSize，物件之間的相對大小就穩定了。
       */
      targetSize?: number;
      /** 少數情況仍要手動覆寫縮放倍率時使用（與 targetSize 擇一） */
      scale?: number;
      yOffset?: number;
    };

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
