import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

export function flower(): THREE.Group {
  const g = new THREE.Group();

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2, 5), M(0x4a7a3c));
  stem.position.y = 1;
  g.add(stem);

  const leaf = new THREE.Mesh(jitter(new THREE.SphereGeometry(0.35, 5, 4), 0.05), M(0x5a9a4a));
  leaf.scale.set(1.6, 0.3, 0.8);
  leaf.position.set(0.3, 0.9, 0);
  g.add(leaf);

  const center = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 5), M(0xf2c744, 0.5));
  center.position.y = 2.1;
  g.add(center);

  const petalMat = M(0xe86a9a, 0.5);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const petal = new THREE.Mesh(jitter(new THREE.SphereGeometry(0.22, 5, 4), 0.04), petalMat);
    petal.scale.set(1, 0.6, 1.6);
    const px = Math.cos(a) * 0.35;
    const pz = Math.sin(a) * 0.35;
    petal.position.set(px, 2.1, pz);
    petal.lookAt(px * 2, 2.1, pz * 2);
    g.add(petal);
  }

  return g;
}
