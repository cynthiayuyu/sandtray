import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

/** 沙遊常見的幻想物件：蘑菇屋 */
export function mushroomHouse(): THREE.Group {
  const g = new THREE.Group();

  const stem = new THREE.Mesh(jitter(new THREE.CylinderGeometry(0.9, 1.1, 2.2, 8), 0.08), M(0xf0e6d2, 0.8));
  stem.position.y = 1.1;
  g.add(stem);

  const cap = new THREE.Mesh(
    jitter(new THREE.SphereGeometry(1.7, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2.2), 0.1),
    M(0xc9432f, 0.6),
  );
  cap.position.y = 2.2;
  g.add(cap);

  const spotMat = M(0xf5efe0, 0.5);
  const spots: Array<[number, number, number]> = [
    [0.8, 2.6, 0.9],
    [-1, 2.7, 0.3],
    [0.2, 2.9, -1],
  ];
  spots.forEach(([x, y, z]) => {
    const spot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 5, 4), spotMat);
    spot.position.set(x, y, z);
    g.add(spot);
  });

  const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.1), M(0x5a3d28));
  door.position.set(0, 0.55, 1.05);
  g.add(door);

  const win = new THREE.Mesh(new THREE.CircleGeometry(0.25, 8), M(0x9fc4d8, 0.4));
  win.position.set(1.0, 1.3, 0.6);
  win.rotation.y = -0.5;
  g.add(win);

  return g;
}
