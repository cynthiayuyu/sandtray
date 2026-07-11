import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

export function boat(): THREE.Group {
  const g = new THREE.Group();
  const hullGeo = new THREE.CylinderGeometry(1.1, 0.55, 1.1, 7, 1);
  hullGeo.scale(1, 1, 2.4);
  hullGeo.rotateY(Math.PI / 2);
  const hull = new THREE.Mesh(jitter(hullGeo, 0.06), M(0x8a5a3a));
  hull.position.y = 0.55;
  g.add(hull);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.4, 5), M(0x5a3d28));
  mast.position.y = 2.3;
  g.add(mast);

  const sailShape = new THREE.Shape();
  sailShape.moveTo(0, 0);
  sailShape.lineTo(0, 2.6);
  sailShape.lineTo(1.7, 0.25);
  sailShape.lineTo(0, 0);
  const sail = new THREE.Mesh(
    new THREE.ShapeGeometry(sailShape),
    new THREE.MeshStandardMaterial({ color: 0xf0e8d5, side: THREE.DoubleSide, roughness: 0.9 }),
  );
  sail.position.set(0.1, 1.15, 0);
  g.add(sail);

  return g;
}
