import * as THREE from 'three';
import { jitter } from './jitter';
import { M } from './materials';

/** 燃燒中的營火：石圈＋交疊圓木＋自發光火焰（外部素材包沒有含火焰的營火，這裡自己做） */
export function burningCampfire(): THREE.Group {
  const g = new THREE.Group();

  const stoneMat = M(0x8b8478);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const s = new THREE.Mesh(jitter(new THREE.IcosahedronGeometry(0.32, 0), 0.1), stoneMat);
    s.position.set(Math.cos(a) * 1.3, 0.22, Math.sin(a) * 1.3);
    g.add(s);
  }

  const logMat = M(0x5a3d28);
  for (let i = 0; i < 3; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.6, 6), logMat);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = (i / 3) * Math.PI;
    log.position.y = 0.25 + i * 0.1;
    g.add(log);
  }

  const flameOuter = new THREE.Mesh(
    jitter(new THREE.ConeGeometry(0.55, 1.5, 7), 0.08),
    new THREE.MeshStandardMaterial({
      color: 0xff8c1a,
      emissive: 0xff6a00,
      emissiveIntensity: 1.1,
      roughness: 0.4,
      flatShading: true,
    }),
  );
  flameOuter.position.y = 1.1;
  g.add(flameOuter);

  const flameInner = new THREE.Mesh(
    new THREE.ConeGeometry(0.28, 0.9, 6),
    new THREE.MeshStandardMaterial({
      color: 0xffd54a,
      emissive: 0xffb300,
      emissiveIntensity: 1.4,
      roughness: 0.3,
      flatShading: true,
    }),
  );
  flameInner.position.y = 1.25;
  g.add(flameInner);

  return g;
}
