import * as THREE from 'three';
import { FLOOR, MAX_H } from '../config/constants';

/**
 * 依高度為沙面每個頂點上色：挖到底＝水色，往上依序是濕沙、乾沙、亮部沙丘。
 * 這裡直接寫進 geometry 的 per-vertex color attribute（見 SandHeightfield 建構時的設定）。
 */
export function paintSand(geo: THREE.BufferGeometry): void {
  const pos = geo.attributes.position;
  const col = geo.attributes.color;
  const dry = new THREE.Color(0xdcc79c);
  const lite = new THREE.Color(0xe9d9b4);
  const wet = new THREE.Color(0xa9915f);
  const blue = new THREE.Color(0x2f6f8f);
  const c = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const h = pos.getY(i);
    if (h <= FLOOR + 1.1) {
      c.copy(blue);
    } else if (h < -1.2) {
      const t = (h - (FLOOR + 1.1)) / (-1.2 - (FLOOR + 1.1));
      c.copy(blue).lerp(wet, t);
    } else if (h < 0.6) {
      const t = (h + 1.2) / 1.8;
      c.copy(wet).lerp(dry, t);
    } else {
      const t = Math.min((h - 0.6) / (MAX_H - 0.6), 1);
      c.copy(dry).lerp(lite, t);
    }
    // 細微顆粒感
    const n = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const g = 1 + (n - 0.5) * 0.045;
    col.setXYZ(i, c.r * g, c.g * g, c.b * g);
  }
  col.needsUpdate = true;
  geo.computeVertexNormals();
}
