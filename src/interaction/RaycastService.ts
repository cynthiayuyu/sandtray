import * as THREE from 'three';

export type HitSurface = 'sand' | 'object';

export interface CombinedHit {
  point: THREE.Vector3;
  surface: HitSurface;
  targetObject?: THREE.Object3D;
}

/**
 * 單一 Raycaster 重複使用，對沙面與所有已放置物件做組合式的命中判定（用於疊放：
 * 落點若命中其他物件，直接採用該次交點的世界座標 Y，等同「命中最高點」）。
 */
export class RaycastService {
  private readonly ray = new THREE.Raycaster();
  private readonly camera: THREE.Camera;
  private readonly sandMesh: THREE.Object3D;
  private readonly getObjectGroups: () => THREE.Object3D[];

  constructor(camera: THREE.Camera, sandMesh: THREE.Object3D, getObjectGroups: () => THREE.Object3D[]) {
    this.camera = camera;
    this.sandMesh = sandMesh;
    this.getObjectGroups = getObjectGroups;
  }

  /** 純沙面命中（用於堆沙/挖沙筆刷） */
  hitSand(ndc: THREE.Vector2): THREE.Vector3 | null {
    this.ray.setFromCamera(ndc, this.camera);
    const hits = this.ray.intersectObject(this.sandMesh);
    return hits.length ? hits[0].point : null;
  }

  /** 純物件命中，回傳最上層帶有 userData.placedId 的 group */
  hitObject(ndc: THREE.Vector2): THREE.Object3D | null {
    this.ray.setFromCamera(ndc, this.camera);
    const hits = this.ray.intersectObjects(this.getObjectGroups(), true);
    if (!hits.length) return null;
    let o: THREE.Object3D | null = hits[0].object;
    while (o && o.parent && !o.userData.placedId) o = o.parent;
    return o && o.userData.placedId ? o : null;
  }

  /**
   * 由正上方垂直向下 raycast，判斷 (x,z) 這一點正下方的承載面是沙面還是另一個物件的頂部
   * （排除 excludeGroup 自身，避免物件自我遮擋）。用於放置/拖曳/塑沙後重新沉降時判斷落點高度，
   * 比沿著攝影機視線 raycast 更穩定（不受視角角度影響，垂直投影永遠是同一個答案）。
   */
  hitFromAbove(x: number, z: number, excludeGroup?: THREE.Object3D): CombinedHit | null {
    this.ray.set(new THREE.Vector3(x, 300, z), new THREE.Vector3(0, -1, 0));
    const candidateGroups = this.getObjectGroups().filter((g) => g !== excludeGroup);
    const hits = this.ray.intersectObjects([this.sandMesh, ...candidateGroups], true);
    for (const hit of hits) {
      if (hit.object === this.sandMesh) {
        return { point: hit.point, surface: 'sand' };
      }
      let o: THREE.Object3D | null = hit.object;
      while (o && o.parent && !o.userData.placedId) o = o.parent;
      if (o && o.userData.placedId && o !== excludeGroup) {
        return { point: hit.point, surface: 'object', targetObject: o };
      }
    }
    return null;
  }
}
