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

  // 動物
  {
    id: 'animal_snake',
    category: 'animal',
    label: '蛇',
    keywords: ['蛇', 'snake'],
    icon: '🐍',
    visualSource: { type: 'procedural', builderKey: 'snake' },
  },
  {
    id: 'animal_bird',
    category: 'animal',
    label: '鳥',
    keywords: ['鳥', '小鳥', 'bird'],
    icon: '🐦',
    visualSource: { type: 'procedural', builderKey: 'bird' },
  },
  {
    id: 'animal_horse',
    category: 'animal',
    label: '馬',
    keywords: ['馬', 'horse'],
    icon: '🐴',
    visualSource: { type: 'procedural', builderKey: 'horse' },
  },
  {
    id: 'animal_turtle',
    category: 'animal',
    label: '烏龜',
    keywords: ['烏龜', '龜', 'turtle'],
    icon: '🐢',
    visualSource: { type: 'procedural', builderKey: 'turtle' },
  },

  // 宗教／神話
  {
    id: 'religious_cross',
    category: 'religious_mythical',
    label: '十字架',
    keywords: ['十字架', '十字', 'cross'],
    icon: '✝️',
    visualSource: { type: 'procedural', builderKey: 'cross' },
  },
  {
    id: 'religious_stupa',
    category: 'religious_mythical',
    label: '佛塔',
    keywords: ['佛塔', '寶塔', '佛', 'stupa', 'pagoda'],
    icon: '🛕',
    visualSource: { type: 'procedural', builderKey: 'stupa' },
  },
  {
    id: 'religious_candle',
    category: 'religious_mythical',
    label: '蠟燭',
    keywords: ['蠟燭', '燭', 'candle'],
    icon: '🕯️',
    visualSource: { type: 'procedural', builderKey: 'candle' },
  },

  // 幻想生物
  {
    id: 'fantasy_mushroom_house',
    category: 'fantasy',
    label: '蘑菇屋',
    keywords: ['蘑菇屋', '蘑菇', '香菇', 'mushroom'],
    icon: '🍄',
    visualSource: { type: 'procedural', builderKey: 'mushroomHouse' },
  },
  {
    id: 'fantasy_crystal',
    category: 'fantasy',
    label: '魔法水晶',
    keywords: ['水晶', '魔法水晶', 'crystal'],
    icon: '🔮',
    visualSource: { type: 'procedural', builderKey: 'crystal' },
  },

  // 植物
  {
    id: 'plant_flower',
    category: 'plant',
    label: '花',
    keywords: ['花', '花朵', 'flower'],
    icon: '🌸',
    visualSource: { type: 'procedural', builderKey: 'flower' },
  },

  // 建築
  {
    id: 'building_bridge',
    category: 'building',
    label: '橋',
    keywords: ['橋', '橋樑', 'bridge'],
    icon: '🌉',
    visualSource: { type: 'procedural', builderKey: 'bridge' },
  },

  // 交通工具
  {
    id: 'vehicle_car',
    category: 'vehicle',
    label: '汽車',
    keywords: ['汽車', '車', 'car'],
    icon: '🚗',
    visualSource: { type: 'procedural', builderKey: 'car' },
  },
];
