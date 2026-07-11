import * as THREE from 'three';
import { TRAY_W, TRAY_D, SEG_X, SEG_Z, SAND_TOP, FLOOR, MAX_H } from '../config/constants';
import { paintSand } from './SandPainter';
import type { SculptPoint, SculptDirection } from './types';

const BRUSH_RADIUS = 6.5;
const BRUSH_STRENGTH = 0.5;

/**
 * 沙面用單層高度場（heightfield）表示：一張 PlaneGeometry，每個頂點的 Y 值即該格的沙高。
 * 設計決策見 README——沙盤僅 7cm 深，治療師只會由上往下塑形丘陵/河谷，不需要洞穴/懸垂結構，
 * 高度場比體素/Marching Cubes 便宜非常多，是務實選擇。
 */
export class SandHeightfield {
  readonly mesh: THREE.Mesh;
  private readonly geo: THREE.PlaneGeometry;
  private readonly changeListeners: Array<() => void> = [];

  constructor(scene: THREE.Scene) {
    this.geo = new THREE.PlaneGeometry(TRAY_W, TRAY_D, SEG_X, SEG_Z);
    this.geo.rotateX(-Math.PI / 2);
    const pos = this.geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, SAND_TOP + (Math.random() - 0.5) * 0.12);
    }
    const colors = new Float32Array(pos.count * 3);
    this.geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: false });
    this.mesh = new THREE.Mesh(this.geo, mat);
    this.mesh.castShadow = this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    paintSand(this.geo);
  }

  /** 取得沙面在世界座標 (x,z) 的高度（取最近格點） */
  heightAt(x: number, z: number): number {
    const pos = this.geo.attributes.position;
    const gx = ((x + TRAY_W / 2) / TRAY_W) * SEG_X;
    const gz = ((z + TRAY_D / 2) / TRAY_D) * SEG_Z;
    const ix = Math.max(0, Math.min(SEG_X, Math.round(gx)));
    const iz = Math.max(0, Math.min(SEG_Z, Math.round(gz)));
    return pos.getY(iz * (SEG_X + 1) + ix);
  }

  /** 高斯筆刷堆沙(dir=1)／挖沙(dir=-1) */
  sculpt(pt: SculptPoint, dir: SculptDirection): void {
    const pos = this.geo.attributes.position;
    const strength = BRUSH_STRENGTH * dir;
    for (let i = 0; i < pos.count; i++) {
      const dx = pos.getX(i) - pt.x;
      const dz = pos.getZ(i) - pt.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < BRUSH_RADIUS * BRUSH_RADIUS) {
        const f = Math.exp(-d2 / (BRUSH_RADIUS * BRUSH_RADIUS * 0.28));
        let h = pos.getY(i) + strength * f;
        h = Math.max(FLOOR + 0.15, Math.min(MAX_H, h));
        pos.setY(i, h);
      }
    }
    pos.needsUpdate = true;
    paintSand(this.geo);
    this.changeListeners.forEach((fn) => fn());
  }

  /** 每次塑沙後需要重新沉降的物件（例如疊放物件）可訂閱此事件 */
  onChanged(fn: () => void): void {
    this.changeListeners.push(fn);
  }
}
