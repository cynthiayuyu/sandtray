import type { CatalogEntry } from './types';

/**
 * 資料驅動的物件目錄。新增物件（包含未來的 GLB 素材包）只需要在此新增一筆資料，
 * 不需要更動任何互動/UI 程式碼——見 objects/ObjectFactory.ts 的 procedural/gltf 分派邏輯。
 */
export const catalogData: CatalogEntry[] = [
  {
    id: 'person_generic',
    category: 'person',
    label: '人',
    keywords: ['人', '人物', 'person', 'human'],
    icon: '🧍',
    visualSource: { type: 'procedural', builderKey: 'person' },
  },
  {
    id: 'plant_tree',
    category: 'plant',
    label: '樹',
    keywords: ['樹', '闊葉樹', 'tree'],
    icon: '🌳',
    visualSource: { type: 'procedural', builderKey: 'tree' },
  },
  {
    id: 'plant_pine',
    category: 'plant',
    label: '松樹',
    keywords: ['松', '松樹', 'pine'],
    icon: '🌲',
    visualSource: { type: 'procedural', builderKey: 'pine' },
  },
  {
    id: 'building_house',
    category: 'building',
    label: '房屋',
    keywords: ['房屋', '房子', '家', 'house'],
    icon: '🏠',
    visualSource: { type: 'procedural', builderKey: 'house' },
  },
  {
    id: 'natural_rock',
    category: 'natural',
    label: '岩石',
    keywords: ['岩石', '石頭', 'rock', 'stone'],
    icon: '🪨',
    visualSource: { type: 'procedural', builderKey: 'rock' },
  },
  {
    id: 'vehicle_boat',
    category: 'vehicle',
    label: '小船',
    keywords: ['船', '小船', '帆船', 'boat'],
    icon: '⛵',
    visualSource: { type: 'procedural', builderKey: 'boat' },
  },
  {
    id: 'demo_gltf_tree',
    category: 'plant',
    label: '（示範）GLTF 樹',
    keywords: ['示範', 'demo', 'gltf'],
    icon: '🌴',
    // 刻意指向一個不存在的檔案：用來驗證「載入失敗→優雅降級為佔位符」這條路徑。
    // 之後接上真實的 Quaternius／Kenney 等 CC0 素材包時，只要把 url 換成實際檔案即可。
    visualSource: { type: 'gltf', url: 'assets/models/placeholder/tree-demo.glb' },
  },
];
