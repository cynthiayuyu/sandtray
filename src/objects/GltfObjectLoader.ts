import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * 包裝 THREE.GLTFLoader：以 URL 為 key 做 Promise cache（避免重複下載/解析同一個檔案），
 * 每次放置物件時回傳的是 clone 出來的獨立實例，才不會共用同一份 scale/emissive 狀態。
 */
export class GltfObjectLoader {
  private readonly loader = new GLTFLoader();
  private readonly cache = new Map<string, Promise<THREE.Group>>();

  /** 載入（或取用快取）指定 URL 的 GLB/GLTF，回傳可安全修改的獨立實例 */
  async load(url: string): Promise<THREE.Group> {
    let pending = this.cache.get(url);
    if (!pending) {
      pending = this.loader
        .loadAsync(url)
        .then((gltf) => {
          const root = gltf.scene;
          root.traverse((o) => {
            if (o instanceof THREE.Mesh) {
              o.castShadow = true;
              o.receiveShadow = true;
            }
          });
          return root;
        });
      this.cache.set(url, pending);
    }
    const cached = await pending;
    const instance = cached.clone(true);
    // clone(true) 會共用材質：若不逐一複製，選取高亮（emissive）會同時染到同款模型的所有分身
    instance.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
      }
    });
    return instance;
  }
}
