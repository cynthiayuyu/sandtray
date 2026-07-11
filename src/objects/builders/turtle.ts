import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

export function turtle(): THREE.Group {
  const g = new THREE.Group();
  const skinMat = M(0x8ab86a, 0.7);

  const shell = new THREE.Mesh(
    jitter(new THREE.SphereGeometry(0.9, 8, 6, 0, Math.PI * 2, 0, Math.PI / 1.7), 0.06),
    M(0x4a7a3c),
  );
  shell.position.y = 0.6;
  g.add(shell);

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.75, 7, 5), skinMat);
  body.scale.set(1, 0.5, 1);
  body.position.y = 0.35;
  g.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 5), skinMat);
  head.position.set(0, 0.4, 1);
  g.add(head);

  const legPositions: Array<[number, number]> = [
    [-0.6, 0.5],
    [0.6, 0.5],
    [-0.6, -0.5],
    [0.6, -0.5],
  ];
  legPositions.forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.SphereGeometry(0.22, 5, 4), skinMat);
    leg.position.set(x, 0.25, z);
    g.add(leg);
  });

  return g;
}
