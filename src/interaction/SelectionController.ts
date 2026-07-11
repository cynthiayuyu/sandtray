import * as THREE from 'three';
import type { PlacedObject } from '../objects/PlacedObject';

const HIGHLIGHT = 0x332211;

export type SelectionListener = (selected: PlacedObject | null) => void;

/** 目前選取的物件狀態 + 高亮顯示，並在變化時通知訂閱者（例如物件控制面板要顯示/隱藏） */
export class SelectionController {
  private current: PlacedObject | null = null;
  private readonly listeners: SelectionListener[] = [];

  get selected(): PlacedObject | null {
    return this.current;
  }

  select(placed: PlacedObject | null): void {
    if (this.current === placed) return;
    if (this.current) setEmissive(this.current.group, 0x000000);
    this.current = placed;
    if (placed) setEmissive(placed.group, HIGHLIGHT);
    this.listeners.forEach((fn) => fn(placed));
  }

  onChange(fn: SelectionListener): void {
    this.listeners.push(fn);
  }
}

function setEmissive(group: THREE.Group, hex: number): void {
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if ('emissive' in m && m.emissive instanceof THREE.Color) {
          m.emissive.setHex(hex);
        }
      });
    }
  });
}
