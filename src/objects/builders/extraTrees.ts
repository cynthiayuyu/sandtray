import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

// 與程序化「樹／松樹」同一套亮綠色調（0x7fae52 / 0x2e5b3f），
// 補足外部素材偏灰橄欖色之外的鮮綠選擇。

/** 大樹：更寬的樹冠 */
export function bigTree(): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(jitter(new THREE.CylinderGeometry(0.8, 1.2, 5, 7), 0.18), M(0x5a3d28));
  trunk.position.y = 2.5;
  g.add(trunk);
  const blobs: Array<[number, number, number, number]> = [
    [0, 7, 0, 3.4],
    [2.4, 6, 0.8, 2.4],
    [-2.2, 6.2, -0.8, 2.3],
    [0.6, 5.6, 2.2, 2],
    [-0.5, 5.8, -2.2, 2],
  ];
  blobs.forEach(([x, y, z, r]) => {
    const b = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(r, 0), 0.35), M(0x7fae52));
    b.position.set(x, y, z);
    g.add(b);
  });
  return g;
}

/** 小樹苗 */
export function sapling(): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 1.6, 5), M(0x5a3d28));
  trunk.position.y = 0.8;
  g.add(trunk);
  const leaf = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(1, 0), 0.18), M(0x8fbe62));
  leaf.position.y = 2.1;
  g.add(leaf);
  return g;
}

/** 高松樹：比原本的松樹更高瘦 */
export function tallPine(): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.65, 2.6, 6), M(0x4a3020));
  trunk.position.y = 1.3;
  g.add(trunk);
  const tiers: Array<[number, number]> = [
    [2.6, 3.6],
    [2.1, 5.6],
    [1.6, 7.4],
    [1.1, 8.9],
  ];
  tiers.forEach(([r, y]) => {
    const c = new THREE.Mesh(jitter(new THREE.ConeGeometry(r, 2.8, 7), 0.15), M(0x2e5b3f));
    c.position.y = y;
    g.add(c);
  });
  return g;
}

/** 果樹：亮綠樹冠＋紅色果實 */
export function fruitTree(): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(jitter(new THREE.CylinderGeometry(0.5, 0.75, 3.6, 6), 0.14), M(0x5a3d28));
  trunk.position.y = 1.8;
  g.add(trunk);
  const crown = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(2.6, 0), 0.3), M(0x7fae52));
  crown.position.y = 5;
  g.add(crown);
  const fruitMat = M(0xd8443c, 0.5);
  const fruits: Array<[number, number, number]> = [
    [1.6, 5.4, 1.4],
    [-1.8, 4.6, 1.1],
    [0.4, 6.4, -1.6],
    [-1.2, 5.8, -1.4],
    [1.9, 4.4, -0.8],
  ];
  fruits.forEach(([x, y, z]) => {
    const f = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 5), fruitMat);
    f.position.set(x, y, z);
    g.add(f);
  });
  return g;
}
