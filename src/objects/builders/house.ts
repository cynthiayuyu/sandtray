import * as THREE from 'three';
import { M } from './materials';

export function house(): THREE.Group {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3, 3.8), M(0xe4d6b8));
  wall.position.y = 1.5;
  g.add(wall);

  const roofGeo = new THREE.CylinderGeometry(0.01, 3.55, 2.3, 4, 1);
  roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, M(0xa5563c));
  roof.position.y = 4.15;
  roof.scale.set(1.05, 1, 0.86);
  g.add(roof);

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.7, 0.15), M(0x5a3d28));
  door.position.set(0, 0.85, 1.95);
  g.add(door);

  const win = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.12), M(0x9fc4d8, 0.4));
  win.position.set(-1.3, 1.8, 1.95);
  g.add(win);
  const win2 = win.clone();
  win2.position.x = 1.3;
  g.add(win2);

  return g;
}
