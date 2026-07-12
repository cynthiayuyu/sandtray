import * as THREE from 'three';
import { TRAY_W, TRAY_D } from '../config/constants';
import type { RaycastService } from '../interaction/RaycastService';
import type { SandHeightfield } from '../sand/SandHeightfield';
import type { PlacedObject } from './PlacedObject';

const MARGIN = 1;
const OBJECT_Y_EPS = 0.02; // 避免與承載面 z-fighting 的極小間隙
const SAND_EMBED = 0.1; // 物件底部略微陷入沙面，看起來像放在沙上而非懸浮

const box = new THREE.Box3();

/**
 * 讓一個已放置物件依目前 XZ 座標重新沉降：由正上方垂直 raycast 判斷正下方是沙面還是
 * 另一個物件，命中物件時採用命中點的世界座標 Y（即「疊放在最高點」）；找不到承載物時
 * （例如疊放對象被移走或刪除）優雅退回沙面高度。
 *
 * 落地高度以「旋轉/縮放後的實際包圍盒最低點」對齊承載面，而不是模型原點——否則
 * 物件躺倒後（旋轉 90°）會有一半身體埋進沙裡。另外套用 buryOffset（埋沙功能，
 * 只能為負值），讓使用者可以刻意把物件埋進沙中。
 */
export function settleObject(placed: PlacedObject, raycast: RaycastService, sand: SandHeightfield): void {
  const x = Math.max(-TRAY_W / 2 + MARGIN, Math.min(TRAY_W / 2 - MARGIN, placed.group.position.x));
  const z = Math.max(-TRAY_D / 2 + MARGIN, Math.min(TRAY_D / 2 - MARGIN, placed.group.position.z));
  placed.group.position.x = x;
  placed.group.position.z = z;

  let surfaceY: number;
  const hit = raycast.hitFromAbove(x, z, placed.group);
  if (hit && hit.surface === 'object' && hit.targetObject) {
    surfaceY = hit.point.y + OBJECT_Y_EPS;
    placed.stackParentId = hit.targetObject.userData.placedId ?? null;
  } else {
    surfaceY = sand.heightAt(x, z) - SAND_EMBED;
    placed.stackParentId = null;
  }

  // 以包圍盒最低點貼齊承載面：newY = 目前 groupY + (目標底部高度 - 目前底部高度)
  box.setFromObject(placed.group);
  if (!box.isEmpty()) {
    placed.group.position.y += surfaceY - box.min.y + placed.buryOffset;
  } else {
    placed.group.position.y = surfaceY + placed.buryOffset;
  }
}

/** 物件目前的世界空間高度（埋沙夾限用） */
export function objectHeight(placed: PlacedObject): number {
  box.setFromObject(placed.group);
  return box.isEmpty() ? 0 : box.max.y - box.min.y;
}
