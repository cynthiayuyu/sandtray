import * as THREE from 'three';
import { DRAG_MOVE_THRESHOLD, OBJECT_MIN_SCALE, OBJECT_MAX_SCALE } from '../config/constants';
import { findEntry } from '../catalog/catalog.index';
import type { ObjectFactory } from '../objects/ObjectFactory';
import type { ObjectRegistry } from '../objects/ObjectRegistry';
import { PlacedObject } from '../objects/PlacedObject';
import { settleObject } from '../objects/settle';
import type { SandHeightfield } from '../sand/SandHeightfield';
import type { OrbitCamera } from '../camera/OrbitCamera';
import type { ActionLogSink } from '../history/ActionLog';
import type { PointerPoint } from './PointerTracker';
import type { RaycastService } from './RaycastService';
import type { SelectionController } from './SelectionController';

export type Mode = 'orbit' | 'raise' | 'dig' | 'place';

export interface InputStateMachineDeps {
  scene: THREE.Scene;
  raycast: RaycastService;
  sand: SandHeightfield;
  registry: ObjectRegistry;
  selection: SelectionController;
  camera: OrbitCamera;
  factory: ObjectFactory;
  actionLog: ActionLogSink;
  onPlacingStateChange?: (loading: boolean) => void;
  onObjectPlaced?: (placed: PlacedObject) => void;
}

/**
 * 核心互動狀態機：管理模式（視角/堆沙/挖沙/物件）與點選/拖曳/疊放的判斷。
 *
 * 視角模式下的兩段式手勢是本次修正誤觸的重點：點一下未選取的物件只會「選取」，
 * 不會立刻拖走；只有已經被選取的物件，接下來的拖曳才會真的搬動它。點在空沙面
 * （或另一個未選取物件）上且沒有位移，則清除/切換選取。物件模式（place）維持
 * 原本「點物件即可立刻拖曳」的行為，因為使用者在該模式下本來就是在操作物件，
 * 不像視角模式是隨手轉鏡頭。
 */
export class InputStateMachine {
  mode: Mode = 'orbit';
  placeKind: string | null = null;

  private dragging = false;
  private moved = false;
  private lastX = 0;
  private lastY = 0;
  private hitOnDown = false;
  private armedDrag: PlacedObject | null = null;
  private readonly deps: InputStateMachineDeps;

  constructor(deps: InputStateMachineDeps) {
    this.deps = deps;
  }

  setMode(mode: Mode): void {
    this.mode = mode;
    if (mode !== 'place') this.placeKind = null;
    this.dragging = false;
    this.armedDrag = null;
  }

  onDown(p: PointerPoint): void {
    this.lastX = p.clientX;
    this.lastY = p.clientY;
    this.dragging = true;
    this.moved = false;
    this.hitOnDown = false;
    this.armedDrag = null;

    if (this.mode === 'raise' || this.mode === 'dig') {
      const pt = this.deps.raycast.hitSand(p.ndc);
      if (pt) {
        this.deps.sand.sculpt({ x: pt.x, z: pt.z }, this.mode === 'raise' ? 1 : -1);
        this.resettleAll();
      }
      return;
    }

    const hitGroup = this.deps.raycast.hitObject(p.ndc);
    const hitPlaced = hitGroup ? this.deps.registry.getById(hitGroup.userData.placedId) ?? null : null;
    this.hitOnDown = !!hitPlaced;

    if (this.mode === 'place' && this.placeKind) {
      // 沙面永遠涵蓋整個沙盤，用它取得放置點的 XZ 座標；即使這次點擊落在既有物件上
      // （例如要把人放到岩石上），settleObject 之後會用垂直 raycast 判斷該處其實該疊放在物件頂部。
      const pt = this.deps.raycast.hitSand(p.ndc);
      if (pt) void this.placeNewObject(this.placeKind, pt);
      this.moved = true;
      return;
    }

    if (hitPlaced) {
      if (this.mode === 'place' || this.deps.selection.selected === hitPlaced) {
        // 物件模式：立即可拖曳。視角模式且已選取：這次按住可以開始拖曳。
        this.armedDrag = hitPlaced;
      } else {
        // 視角模式下點到「尚未選取」的物件：只選取，不拖曳（誤觸修正的核心）
        this.deps.selection.select(hitPlaced);
      }
    }
  }

  onMove(p: PointerPoint): void {
    if (!this.dragging) return;

    if (this.mode === 'raise' || this.mode === 'dig') {
      const pt = this.deps.raycast.hitSand(p.ndc);
      if (pt) {
        this.deps.sand.sculpt({ x: pt.x, z: pt.z }, this.mode === 'raise' ? 1 : -1);
        this.resettleAll();
      }
      return;
    }

    const dx = p.clientX - this.lastX;
    const dy = p.clientY - this.lastY;
    if (Math.abs(dx) + Math.abs(dy) > DRAG_MOVE_THRESHOLD) this.moved = true;
    this.lastX = p.clientX;
    this.lastY = p.clientY;

    if (this.armedDrag) {
      const pt = this.deps.raycast.hitSand(p.ndc);
      if (pt) {
        this.armedDrag.group.position.x = pt.x;
        this.armedDrag.group.position.z = pt.z;
        settleObject(this.armedDrag, this.deps.raycast, this.deps.sand);
        this.resettleChildrenOf(this.armedDrag.id);
        this.deps.actionLog.emit({
          type: 'object.move',
          timestamp: Date.now(),
          placedId: this.armedDrag.id,
          x: this.armedDrag.group.position.x,
          z: this.armedDrag.group.position.z,
        });
      }
      return;
    }

    // 視角軌道：物件模式沒有選中拖曳目標時，或視角模式下沒有已選取物件被按住時，都走這裡
    this.deps.camera.applyDelta(dx, dy);
  }

  onUp(): void {
    if (this.mode === 'orbit' && !this.moved && !this.hitOnDown) {
      this.deps.selection.select(null);
    }
    this.dragging = false;
    this.armedDrag = null;
  }

  onWheelZoom(factor: number, point: PointerPoint): void {
    const hit = this.deps.raycast.hitSand(point.ndc);
    this.deps.camera.zoomToward(hit, factor);
  }

  onPinchZoom(factor: number, point: PointerPoint): void {
    const selected = this.deps.selection.selected;
    if (selected) {
      const next = selected.scale / factor;
      selected.scale = Math.max(OBJECT_MIN_SCALE, Math.min(OBJECT_MAX_SCALE, next));
      applyTransform(selected);
    } else {
      const hit = this.deps.raycast.hitSand(point.ndc);
      this.deps.camera.zoomToward(hit, factor);
    }
  }

  private async placeNewObject(kindId: string, pt: THREE.Vector3): Promise<void> {
    const entry = findEntry(kindId);
    if (!entry) return;
    const isAsync = entry.visualSource.type === 'gltf';
    if (isAsync) this.deps.onPlacingStateChange?.(true);
    try {
      const { group, isPlaceholderFallback } = await this.deps.factory.create(entry);
      group.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      group.position.set(pt.x, 0, pt.z);
      group.rotation.y = Math.random() * Math.PI * 2;
      if (entry.defaultScale) group.scale.setScalar(entry.defaultScale);
      this.deps.scene.add(group);

      const placed = new PlacedObject(kindId, group, isPlaceholderFallback);
      placed.scale = entry.defaultScale ?? 1;
      this.deps.registry.add(placed);
      settleObject(placed, this.deps.raycast, this.deps.sand);
      this.deps.selection.select(placed);
      this.deps.actionLog.emit({ type: 'object.place', timestamp: Date.now(), placedId: placed.id, kindId });
      this.deps.onObjectPlaced?.(placed);
    } finally {
      if (isAsync) this.deps.onPlacingStateChange?.(false);
    }
  }

  private resettleAll(): void {
    for (const placed of this.deps.registry.all()) {
      settleObject(placed, this.deps.raycast, this.deps.sand);
    }
  }

  private resettleChildrenOf(parentId: string): void {
    for (const child of this.deps.registry.childrenOf(parentId)) {
      settleObject(child, this.deps.raycast, this.deps.sand);
      this.resettleChildrenOf(child.id);
    }
  }
}

/** 依 PlacedObject 目前的 scale/flipped 狀態套用到實際的 THREE.Group.scale */
export function applyTransform(placed: PlacedObject): void {
  const sx = placed.scale * (placed.flipped ? -1 : 1);
  placed.group.scale.set(sx, placed.scale, placed.scale);
}
