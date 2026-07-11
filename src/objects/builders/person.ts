import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

export function person(): THREE.Group {
  const g = new THREE.Group();
  const skin = M(0xd8a878);
  const shirt = M(0x4a7fa5);
  const pants = M(0x3c4a63);

  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 1.8, 5), pants);
  legL.position.set(-0.32, 0.9, 0);
  g.add(legL);
  const legR = legL.clone();
  legR.position.x = 0.32;
  g.add(legR);

  const body = new THREE.Mesh(jitter(new THREE.CylinderGeometry(0.62, 0.5, 1.7, 6), 0.06), shirt);
  body.position.y = 2.6;
  g.add(body);

  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 1.5, 5), shirt);
  armL.position.set(-0.82, 2.6, 0);
  armL.rotation.z = 0.18;
  g.add(armL);
  const armR = armL.clone();
  armR.position.x = 0.82;
  armR.rotation.z = -0.18;
  g.add(armR);

  const head = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(0.5, 1), 0.03), skin);
  head.position.y = 4.0;
  g.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.52, 6, 4, 0, Math.PI * 2, 0, 1.25), M(0x2e2018));
  hair.position.y = 4.12;
  g.add(hair);

  return g;
}
