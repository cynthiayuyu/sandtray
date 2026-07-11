import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

export function pine(): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 1.6, 5), M(0x4a3020));
  trunk.position.y = 0.8;
  g.add(trunk);
  const tiers: Array<[number, number]> = [
    [2.6, 3.1],
    [2.1, 4.9],
    [1.6, 6.4],
  ];
  tiers.forEach(([r, y]) => {
    const c = new THREE.Mesh(jitter(new THREE.ConeGeometry(r, 2.6, 7), 0.14), M(0x2e5b3f));
    c.position.y = y;
    g.add(c);
  });
  return g;
}
