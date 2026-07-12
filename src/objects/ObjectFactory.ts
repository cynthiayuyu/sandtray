import * as THREE from 'three';
import type { CatalogEntry } from '../catalog/types';
import { ProceduralBuilderRegistry } from './builders';
import { GltfObjectLoader } from './GltfObjectLoader';

export interface CreateObjectResult {
  group: THREE.Group;
  isPlaceholderFallback: boolean;
}

/**
 * 依 CatalogEntry.visualSource 分派程序化建構或 GLTF 載入。
 * GLTF 載入失敗時 fallback 到 placeholder 程序化物件，讓物件庫即使部分素材缺失也不會壞掉。
 */
export class ObjectFactory {
  private readonly gltfLoader = new GltfObjectLoader();

  async create(entry: CatalogEntry): Promise<CreateObjectResult> {
    if (entry.visualSource.type === 'procedural') {
      const builder = ProceduralBuilderRegistry[entry.visualSource.builderKey];
      const group = builder ? builder() : ProceduralBuilderRegistry.placeholder();
      return { group, isPlaceholderFallback: !builder };
    }

    const { url, targetSize, scale, yOffset } = entry.visualSource;
    try {
      const model = await this.gltfLoader.load(import.meta.env.BASE_URL + url);
      if (targetSize) {
        return { group: normalizeToSize(model, targetSize), isPlaceholderFallback: false };
      }
      if (scale) model.scale.setScalar(scale);
      if (yOffset) model.position.y += yOffset;
      return { group: model, isPlaceholderFallback: false };
    } catch {
      return { group: ProceduralBuilderRegistry.placeholder(), isPlaceholderFallback: true };
    }
  }
}

/**
 * 把模型等比縮放到「最長邊 = targetSize 公分」。外部素材包的原始尺度差異極大，
 * 用 bounding box 正規化才能讓物件庫裡的物件維持一致的相對大小（見 catalog/types.ts）。
 *
 * 縮放/置中/墊底的位移套用在「內層」模型節點上，回傳的外層 wrapper 才是給
 * 放置邏輯操作的 group——因為 placeNewObject/settleObject 會直接覆寫 group.position，
 * 位移若直接寫在同一層會被洗掉，導致模型半埋進沙裡或偏離點擊位置。
 */
function normalizeToSize(model: THREE.Group, targetSize: number): THREE.Group {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  if (maxDim > 0) {
    const s = targetSize / maxDim;
    model.scale.setScalar(s);
    const box2 = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box2.getCenter(center);
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= box2.min.y;
  }
  const wrapper = new THREE.Group();
  wrapper.add(model);
  return wrapper;
}
