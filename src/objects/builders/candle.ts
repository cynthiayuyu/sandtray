import * as THREE from 'three';
import { M } from './materials';

export function candle(): THREE.Group {
  const g = new THREE.Group();

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.8, 8), M(0xf0e6d2, 0.7));
  body.position.y = 0.9;
  g.add(body);

  const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 4), M(0x2e2018));
  wick.position.y = 1.9;
  g.add(wick);

  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xffb347,
    emissive: 0xff8c1a,
    emissiveIntensity: 1.2,
    roughness: 0.4,
    flatShading: true,
  });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 6), flameMat);
  flame.position.y = 2.15;
  g.add(flame);

  return g;
}
