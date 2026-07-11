import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

export function bird(): THREE.Group {
  const g = new THREE.Group();
  const bodyMat = M(0x4a6fa5);

  const body = new THREE.Mesh(jitter(new THREE.SphereGeometry(0.6, 7, 6), 0.05), bodyMat);
  body.scale.set(1, 0.85, 1.4);
  body.position.y = 1;
  g.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 5), bodyMat);
  head.position.set(0, 1.55, 0.7);
  g.add(head);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 4), M(0xd68a3c));
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 1.55, 1.05);
  g.add(beak);

  const wingMat = M(0x3a5a8f);
  const wingGeo = new THREE.ConeGeometry(0.45, 1.2, 4, 1);
  const wingL = new THREE.Mesh(wingGeo, wingMat);
  wingL.rotation.z = Math.PI / 2.2;
  wingL.position.set(-0.6, 1.05, 0);
  g.add(wingL);
  const wingR = wingL.clone();
  wingR.position.x = 0.6;
  wingR.rotation.z = -Math.PI / 2.2;
  g.add(wingR);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 4), wingMat);
  tail.rotation.x = Math.PI / 2.4;
  tail.position.set(0, 0.85, -0.95);
  g.add(tail);

  return g;
}
