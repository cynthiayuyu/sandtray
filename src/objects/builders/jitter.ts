import * as THREE from 'three';

/** 頂點隨機擾動，讓幾何體帶點手作感而非過度規則 */
export function jitter<T extends THREE.BufferGeometry>(geo: T, amt: number): T {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    p.setXYZ(i, p.getX(i) + (Math.random() - 0.5) * amt, p.getY(i) + (Math.random() - 0.5) * amt, p.getZ(i) + (Math.random() - 0.5) * amt);
  }
  geo.computeVertexNormals();
  return geo;
}
