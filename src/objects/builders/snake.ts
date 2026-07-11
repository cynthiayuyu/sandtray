import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

export function snake(): THREE.Group {
  const g = new THREE.Group();
  const mat = M(0x5a8f3c);
  const points: Array<[number, number, number]> = [
    [0, 0.32, 0],
    [0.9, 0.3, 0.5],
    [1.6, 0.28, -0.3],
    [2.4, 0.26, 0.4],
    [3.0, 0.22, -0.2],
    [3.5, 0.18, 0.15],
  ];
  points.forEach(([x, y, z], i) => {
    const r = Math.max(0.5 - i * 0.075, 0.12);
    const seg = new THREE.Mesh(jitter(new THREE.SphereGeometry(r, 7, 6), 0.03), mat);
    seg.position.set(x, y, z);
    g.add(seg);
  });
  const tongue = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.3, 3), M(0xc23a3a));
  tongue.rotation.z = -Math.PI / 2;
  tongue.position.set(3.75, 0.18, 0.15);
  g.add(tongue);
  return g;
}
