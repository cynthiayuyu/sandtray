import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

// 沙遊常用的天體／宗教象徵：素材包裡沒有的用程序化補齊。

/** 太陽：金色圓盤＋放射光芒（立牌式，方便立在沙上） */
export function sun(): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf2c744,
    emissive: 0xcc8f1a,
    emissiveIntensity: 0.5,
    roughness: 0.5,
    flatShading: true,
  });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.25, 12), mat);
  disc.rotation.x = Math.PI / 2;
  disc.position.y = 2.6;
  g.add(disc);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const ray = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.8, 4), mat);
    ray.position.set(Math.cos(a) * 1.8, 2.6 + Math.sin(a) * 1.8, 0);
    ray.rotation.z = a - Math.PI / 2;
    g.add(ray);
  }
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.3, 5), M(0x8a6d4b));
  stand.position.y = 0.65;
  g.add(stand);
  return g;
}

/** 月亮：新月立牌 */
export function moon(): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xe8e4d0,
    emissive: 0x8a8468,
    emissiveIntensity: 0.35,
    roughness: 0.6,
    flatShading: true,
  });
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 1.3, Math.PI * 0.5, Math.PI * 1.5, false);
  const hole = new THREE.Path();
  hole.absarc(0.55, 0, 1.05, Math.PI * 1.5, Math.PI * 0.5, true);
  shape.holes.push(hole);
  const crescent = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: false }), mat);
  crescent.position.set(0.1, 2.6, -0.12);
  g.add(crescent);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.3, 5), M(0x8a6d4b));
  stand.position.y = 0.65;
  g.add(stand);
  return g;
}

/** 星星：五角星立牌 */
export function star(): THREE.Group {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 1.3 : 0.55;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const mat = new THREE.MeshStandardMaterial({
    color: 0xf2d060,
    emissive: 0xb89020,
    emissiveIntensity: 0.4,
    roughness: 0.5,
    flatShading: true,
  });
  const starMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: false }), mat);
  starMesh.position.set(0, 2.7, -0.12);
  g.add(starMesh);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.4, 5), M(0x8a6d4b));
  stand.position.y = 0.7;
  g.add(stand);
  return g;
}

/** 鳥居：日式神社入口 */
export function torii(): THREE.Group {
  const g = new THREE.Group();
  const mat = M(0xc0392b, 0.6);
  const darkMat = M(0x2e2018, 0.7);

  [-1.5, 1.5].forEach((x) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 3.6, 8), mat);
    pillar.position.set(x, 1.8, 0);
    g.add(pillar);
  });

  const topBeam = new THREE.Mesh(jitter(new THREE.BoxGeometry(4.6, 0.35, 0.5), 0.02), darkMat);
  topBeam.position.y = 3.75;
  g.add(topBeam);
  const topBeam2 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.28, 0.42), mat);
  topBeam2.position.y = 3.4;
  g.add(topBeam2);
  const midBeam = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.26, 0.36), mat);
  midBeam.position.y = 2.7;
  g.add(midBeam);

  return g;
}
