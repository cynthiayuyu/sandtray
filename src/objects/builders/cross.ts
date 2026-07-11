import * as THREE from 'three';
import { M } from './materials';

export function cross(): THREE.Group {
  const g = new THREE.Group();
  const mat = M(0xcabf9e, 0.7);
  const vert = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3, 0.35), mat);
  vert.position.y = 1.5;
  g.add(vert);
  const horiz = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.35), mat);
  horiz.position.y = 2.1;
  g.add(horiz);
  return g;
}
