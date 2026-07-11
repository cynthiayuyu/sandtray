import type * as THREE from 'three';
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

    const { url, scale, yOffset } = entry.visualSource;
    try {
      const group = await this.gltfLoader.load(import.meta.env.BASE_URL + url);
      if (scale) group.scale.setScalar(scale);
      if (yOffset) group.position.y += yOffset;
      return { group, isPlaceholderFallback: false };
    } catch {
      return { group: ProceduralBuilderRegistry.placeholder(), isPlaceholderFallback: true };
    }
  }
}
