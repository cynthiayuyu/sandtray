import * as THREE from 'three';
import { M } from './materials';

/** 簡化的佛塔／寶塔造型 */
export function stupa(): THREE.Group {
  const g = new THREE.Group();
  const mat = M(0xd8c48a, 0.6);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.6, 8), mat);
  base.position.y = 0.3;
  g.add(base);

  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.3, 8, 6, 0, Math.PI * 2, 0, Math.PI / 1.8), mat);
  dome.position.y = 1.2;
  g.add(dome);

  const spireBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 1.4, 6), mat);
  spireBase.position.y = 2.4;
  g.add(spireBase);

  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8, 6), M(0xc9a53f, 0.4));
  tip.position.y = 3.4;
  g.add(tip);

  return g;
}
