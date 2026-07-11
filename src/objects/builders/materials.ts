import * as THREE from 'three';

/** 低多邊形風格材質：flatShading 呈現硬邊面 */
export function M(color: number, roughness = 0.9): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, flatShading: true });
}
