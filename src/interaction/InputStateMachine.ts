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
 * 視角模式下的兩段式手勢是誤觸修正的核心：點一下未選取的物件只會「選取」，
 * 不會立刻拖走；只有已經被選取的物件，接下來的拖曳才會真的搬動它。點在空沙面
 * （或另一個未選取物件）上且沒有位移，則清除/切換選取。
 *
 * 物件模式（place）同樣延後判斷這次手勢的意圖到放開／移動超過閾值才決定，而不是
 * 一按下就動作：純點擊（沒有位移）＋已選定物件種類 → 在該處放置（含疊放在既有物件
 * 上）；點擊已存在的物件（沒有位移）→ 選取它；從空沙面開始拖曳 → 視為想轉視角，
 * 不會誤放物件；從既有物件開始拖曳 → 搬動該物件。這樣使用者才能在物件模式下隨手
 * 轉視角，而不會每次按下都多放一個物件。
 */
export class InputStateMachine {
  mode: Mode = 'orbit';
  placeKind: string | null = null;

  private dragging = false;
  private moved = false;
  private lastX = 0;
  private lastY = 0;
  private hitOnDown = false;
  private downNdc: THREE.Vector2 | null = null;
  private downHitPlaced: PlacedObject | null = null;
  private armedDrag: PlacedObject | null = null;
  private placing = false;
  private lastSculptTime = 0;
  private readonly deps: InputStateMachineDeps;

  constructor(deps: InputStateMachineDeps) {
    this.deps = deps;
  }

  setMode(mode: Mode): void {
    this.mode = mode;
    if (mode !== 'place') this.placeKind = null;
    this.dragging = false;
    this.armedDrag = null;
    this.downHitPlaced = null;
  }

  onDown(p: PointerPoint): void {
    this.lastX = p.clientX;
    this.lastY = p.clientY;
    this.dragging = true;
    this.moved = false;
    this.hitOnDown = false;
    this.armedDrag = null;
    this.downNdc = p.ndc.clone();
    this.downHitPlaced = null;

    if (this.mode === 'raise' || this.mode === 'dig') {
      const pt = this.deps.raycast.hitSand(p.ndc);
      if (pt) this.queueSculpt(pt.x, pt.z);
      return;
    }

    const hitGroup = this.deps.raycast.hitObject(p.ndc);
    const hitPlaced = hitGroup ? this.deps.registry.getById(hitGroup.userData.placedId) ?? null : null;
    this.hitOnDown = !!hitPlaced;

    if (this.mode === 'place') {
      // 延後決定：這次手勢究竟是「點擊放置/選取」還是「拖曳搬動既有物件/轉視角」，
      // 要等 onMove 是否跨過位移閾值、或 onUp 沒有位移才知道，見 onMove/onUp。
      this.downHitPlaced = hitPlaced;
      return;
    }

    // 視角模式：既有的兩段式點選/拖曳邏輯
    if (hitPlaced) {
      if (this.deps.selection.selected === hitPlaced) {
        this.armedDrag = hitPlaced;
      } else {
        // 點到「尚未選取」的物件：只選取，不拖曳（誤觸修正的核心）
        this.deps.selection.select(hitPlaced);
      }
    }
  }

  onMove(p: PointerPoint): void {
    if (!this.dragging) return;

    if (this.mode === 'raise' || this.mode === 'dig') {
      const pt = this.deps.raycast.hitSand(p.ndc);
      if (pt) this.queueSculpt(pt.x, pt.z);
      return;
    }

    const dx = p.clientX - this.lastX;
    const dy = p.clientY - this.lastY;
    if (Math.abs(dx) + Math.abs(dy) > DRAG_MOVE_THRESHOLD) this.moved = true;
    this.lastX = p.clientX;
    this.lastY = p.clientY;

    if (!this.armedDrag && this.moved && this.mode === 'place' && this.downHitPlaced) {
      // 物件模式下，拖曳起點在既有物件上：跨過閾值後才確定是要搬動它，而不是放置新物件
      this.armedDrag = this.downHitPlaced;
    }

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

    // 視角軌道：沒有拖曳目標時都走這裡（含物件模式下從空沙面開始的拖曳）
    this.deps.camera.applyDelta(dx, dy);
  }

  onUp(): void {
    if (!this.moved) {
      if (this.mode === 'place' && this.downHitPlaced) {
        // 物件模式下純點擊「既有物件」：一律優先選取它，而不是在它上面再放一個新的——
        // 使用者點已放好的模型多半是想選取/調整，要疊放可以點該物件旁邊的沙面再拖上去
        this.deps.selection.select(this.downHitPlaced);
      } else if (this.mode === 'place' && this.placeKind && this.downNdc && !this.placing) {
        // 純點擊空沙面＋已選定物件種類：放置。placing 旗標防止模型載入中連點造成排隊重複放置
        const pt = this.deps.raycast.hitSand(this.downNdc);
        if (pt) void this.placeNewObject(this.placeKind, pt);
      } else if (this.mode === 'orbit' && !this.hitOnDown) {
        this.deps.selection.select(null);
      }
    }
    this.dragging = false;
    this.armedDrag = null;
    this.downHitPlaced = null;
  }

  /** 平移視角中心（右鍵拖曳／Shift+拖曳／雙指拖曳），與旋轉/縮放獨立 */
  onPan(dx: number, dy: number): void {
    this.deps.camera.pan(dx, dy);
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
    this.placing = true;
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
      this.placing = false;
      if (isAsync) this.deps.onPlacingStateChange?.(false);
    }
  }

  /**
   * 塑沙節流：pointermove 在高更新率的裝置上可以到每秒 120 次以上，每次都重算沙面
   * 顏色/法線並重新沉降物件會明顯卡頓（尤其沙盤上已有多個模型時）。用時間戳把實際
   * 雕刻限制在每 16ms 最多一次（≈60fps），高於此頻率的事件直接略過。
   * 刻意不用 requestAnimationFrame 排程：部分嵌入式 WebView 對輸入事件中註冊的
   * RAF 回呼不可靠，時間戳節流在任何環境行為都一致。
   */
  private queueSculpt(x: number, z: number): void {
    const now = performance.now();
    if (now - this.lastSculptTime < 16) return;
    this.lastSculptTime = now;
    this.deps.sand.sculpt({ x, z }, this.mode === 'raise' ? 1 : -1);
    this.resettleNear(x, z);
  }

  /** 塑沙後只重新沉降筆刷附近的物件，不用每一筆都掃全場 */
  private resettleNear(x: number, z: number, radius = 10): void {
    for (const placed of this.deps.registry.all()) {
      const dx = placed.group.position.x - x;
      const dz = placed.group.position.z - z;
      if (dx * dx + dz * dz <= radius * radius) {
        settleObject(placed, this.deps.raycast, this.deps.sand);
      }
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
