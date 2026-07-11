import * as THREE from 'three';
import { PlacedObject } from './PlacedObject';

/** 已放置物件的清單管理：增刪查，並提供 raycast/匯出所需要的 group 陣列 */
export class ObjectRegistry {
  private readonly items = new Map<string, PlacedObject>();

  add(placed: PlacedObject): void {
    this.items.set(placed.id, placed);
  }

  remove(id: string): void {
    this.items.delete(id);
  }

  getById(id: string): PlacedObject | undefined {
    return this.items.get(id);
  }

  all(): PlacedObject[] {
    return [...this.items.values()];
  }

  allGroups(): THREE.Object3D[] {
    return this.all().map((p) => p.group);
  }

  /** 找出目前以某物件為疊放對象（stackParentId）的所有物件，供刪除/移動時的重新沉降使用 */
  childrenOf(parentId: string): PlacedObject[] {
    return this.all().filter((p) => p.stackParentId === parentId);
  }
}
