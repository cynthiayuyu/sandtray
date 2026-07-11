import { TRAY_W, TRAY_D } from '../config/constants';
import type { RaycastService } from '../interaction/RaycastService';
import type { SandHeightfield } from '../sand/SandHeightfield';
import type { PlacedObject } from './PlacedObject';

const MARGIN = 1;
const OBJECT_Y_EPS = 0.02; // 避免與承載面 z-fighting 的極小間隙

/**
 * 讓一個已放置物件依目前 XZ 座標重新沉降：由正上方垂直 raycast 判斷正下方是沙面還是
 * 另一個物件，命中物件時採用命中點的世界座標 Y（即「疊放在最高點」）；找不到承載物時
 * （例如疊放對象被移走或刪除）優雅退回沙面高度。
 */
export function settleObject(placed: PlacedObject, raycast: RaycastService, sand: SandHeightfield): void {
  const x = Math.max(-TRAY_W / 2 + MARGIN, Math.min(TRAY_W / 2 - MARGIN, placed.group.position.x));
  const z = Math.max(-TRAY_D / 2 + MARGIN, Math.min(TRAY_D / 2 - MARGIN, placed.group.position.z));
  placed.group.position.x = x;
  placed.group.position.z = z;

  const hit = raycast.hitFromAbove(x, z, placed.group);
  if (hit && hit.surface === 'object' && hit.targetObject) {
    placed.group.position.y = hit.point.y + OBJECT_Y_EPS;
    placed.stackParentId = hit.targetObject.userData.placedId ?? null;
    return;
  }

  placed.group.position.y = sand.heightAt(x, z) - 0.12;
  placed.stackParentId = null;
}
