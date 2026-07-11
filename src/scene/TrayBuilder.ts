import * as THREE from 'three';
import { TRAY_W, TRAY_D, TRAY_WALL, FLOOR } from '../config/constants';

/** 建造沙盤木框、內側藍色底板與桌面（不含沙面與水面，見 SandHeightfield / WaterSurface） */
export function buildTray(scene: THREE.Scene): void {
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a3526, roughness: 0.85 });
  const woodTop = new THREE.MeshStandardMaterial({ color: 0x5c452f, roughness: 0.8 });
  const t = 2.4;
  const h = TRAY_WALL + 2.2;
  const y = FLOOR + h / 2;
  const mk = (w: number, d: number, x: number, z: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [woodMat, woodMat, woodTop, woodMat, woodMat, woodMat]);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
  };
  mk(TRAY_W + t * 2, t, 0, -(TRAY_D / 2 + t / 2));
  mk(TRAY_W + t * 2, t, 0, TRAY_D / 2 + t / 2);
  mk(t, TRAY_D, -(TRAY_W / 2 + t / 2), 0);
  mk(t, TRAY_D, TRAY_W / 2 + t / 2, 0);

  // 內側藍色底板（水下）
  const base = new THREE.Mesh(
    new THREE.PlaneGeometry(TRAY_W, TRAY_D),
    new THREE.MeshStandardMaterial({ color: 0x1e4a63, roughness: 0.6 }),
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = FLOOR;
  scene.add(base);

  // 桌面
  const table = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({ color: 0x2b221a, roughness: 0.95 }),
  );
  table.rotation.x = -Math.PI / 2;
  table.position.y = FLOOR - 0.01;
  table.receiveShadow = true;
  scene.add(table);
}
