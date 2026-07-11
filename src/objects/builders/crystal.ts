import * as THREE from 'three';

export function crystal(): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x8a6fd8,
    roughness: 0.2,
    metalness: 0.3,
    emissive: 0x4a2f8a,
    emissiveIntensity: 0.3,
    flatShading: true,
  });

  const shapes: Array<[number, number, number, number]> = [
    [0, 1.2, 0, 1.0],
    [0.6, 0.7, 0.3, 0.6],
    [-0.5, 0.6, -0.2, 0.55],
  ];
  shapes.forEach(([x, y, z, s]) => {
    const m = new THREE.Mesh(new THREE.OctahedronGeometry(s, 0), mat);
    m.position.set(x, y, z);
    m.rotation.set(Math.random(), Math.random(), Math.random());
    g.add(m);
  });

  return g;
}
