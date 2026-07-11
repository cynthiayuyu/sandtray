import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

export function rock(): THREE.Group {
  const g = new THREE.Group();
  const r1 = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(1.7, 0), 0.4), M(0x8b8478));
  r1.position.y = 1.1;
  r1.rotation.set(0.3, 0.7, 0.1);
  g.add(r1);
  const r2 = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(1, 0), 0.3), M(0x9a917f));
  r2.position.set(1.6, 0.6, 0.6);
  g.add(r2);
  return g;
}
