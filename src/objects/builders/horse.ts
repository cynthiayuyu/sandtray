import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

export function horse(): THREE.Group {
  const g = new THREE.Group();
  const mat = M(0x8a5a3a);
  const maneMat = M(0x3a281c);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 1.6, 4, 8), mat);
  body.rotation.z = Math.PI / 2;
  body.position.y = 1.6;
  g.add(body);

  const legPositions: Array<[number, number]> = [
    [-0.6, -0.7],
    [0.6, -0.7],
    [-0.6, 0.7],
    [0.6, 0.7],
  ];
  legPositions.forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 1.6, 5), mat);
    leg.position.set(x, 0.8, z);
    g.add(leg);
  });

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.2, 6), mat);
  neck.position.set(0, 2.2, 1.1);
  neck.rotation.x = -0.5;
  g.add(neck);

  const head = new THREE.Mesh(jitter(new THREE.BoxGeometry(0.5, 0.5, 0.9), 0.05), mat);
  head.position.set(0, 2.7, 1.75);
  g.add(head);

  const mane = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.15), maneMat);
  mane.position.set(0, 2.3, 0.75);
  mane.rotation.x = -0.5;
  g.add(mane);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.0, 5), maneMat);
  tail.position.set(0, 1.7, -1.5);
  tail.rotation.x = Math.PI * 0.55;
  g.add(tail);

  return g;
}
