import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

/** GLTF 載入失敗時的佔位符：低多邊形警示色標記，讓使用者一眼看出這裡的模型還沒到位 */
export function placeholder(): THREE.Group {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.2, 0.4, 6), M(0x8a6d4b));
  base.position.y = 0.2;
  g.add(base);
  const marker = new THREE.Mesh(jitter(new THREE.OctahedronGeometry(0.9, 0), 0.08), M(0xd68a3c));
  marker.position.y = 1.6;
  g.add(marker);
  return g;
}
