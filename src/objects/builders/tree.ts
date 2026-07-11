import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

export function tree(): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(jitter(new THREE.CylinderGeometry(0.55, 0.85, 4.2, 6), 0.16), M(0x5a3d28));
  trunk.position.y = 2.1;
  g.add(trunk);
  const blobs: Array<[number, number, number, number]> = [
    [0, 5.6, 0, 2.7],
    [1.6, 4.8, 0.5, 1.9],
    [-1.5, 4.9, -0.6, 1.8],
    [0.3, 4.6, 1.5, 1.6],
  ];
  blobs.forEach(([x, y, z, r]) => {
    const b = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(r, 0), 0.32), M(0x7fae52));
    b.position.set(x, y, z);
    g.add(b);
  });
  return g;
}
