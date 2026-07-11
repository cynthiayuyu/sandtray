import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

/** 沙遊中常見、連結兩岸的橋 */
export function bridge(): THREE.Group {
  const g = new THREE.Group();
  const woodMat = M(0x8a6d4b, 0.7);
  const railMat = M(0x6a5030, 0.8);

  const deck = new THREE.Mesh(jitter(new THREE.BoxGeometry(1.8, 0.35, 6), 0.04), woodMat);
  deck.position.y = 1.3;
  g.add(deck);

  [-0.85, 0.85].forEach((x) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 6), railMat);
    rail.position.set(x, 1.9, 0);
    g.add(rail);
  });

  [-2.6, 2.6].forEach((z) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 2.6, 6), woodMat);
    post.position.set(0, 0.5, z);
    g.add(post);
  });

  return g;
}
