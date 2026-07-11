import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

export function car(): THREE.Group {
  const g = new THREE.Group();
  const bodyMat = M(0xd8443c, 0.5);

  const body = new THREE.Mesh(jitter(new THREE.BoxGeometry(2.4, 0.7, 1.2), 0.05), bodyMat);
  body.position.y = 0.75;
  g.add(body);

  const cabin = new THREE.Mesh(jitter(new THREE.BoxGeometry(1.3, 0.6, 1.1), 0.04), bodyMat);
  cabin.position.set(-0.1, 1.35, 0);
  g.add(cabin);

  const wheelMat = M(0x2a2420, 0.9);
  const wheelPositions: Array<[number, number]> = [
    [-0.8, -0.55],
    [0.8, -0.55],
    [-0.8, 0.55],
    [0.8, 0.55],
  ];
  wheelPositions.forEach(([x, z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.25, 8), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.32, z);
    g.add(wheel);
  });

  return g;
}
