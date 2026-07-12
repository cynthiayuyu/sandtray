import './style.css';
import * as THREE from 'three';
import { createSceneBundle } from './scene/SceneSetup';
import { buildTray } from './scene/TrayBuilder';
import { WaterSurface } from './scene/WaterSurface';
import { SandHeightfield } from './sand/SandHeightfield';
import { OrbitCamera } from './camera/OrbitCamera';
import { ObjectRegistry } from './objects/ObjectRegistry';
import { ObjectFactory } from './objects/ObjectFactory';
import { settleObject, objectHeight } from './objects/settle';
import { RaycastService } from './interaction/RaycastService';
import { SelectionController } from './interaction/SelectionController';
import { InputStateMachine, applyTransform, type Mode } from './interaction/InputStateMachine';
import { attachPointerTracker } from './interaction/PointerTracker';
import { NoopActionLogSink } from './history/ActionLog';
import { exportPng } from './export/PngExporter';
import { Toast } from './ui/Toast';
import { HintPanel } from './ui/HintPanel';
import { Toolbar, toastForMode, type ExportView } from './ui/Toolbar';
import { ObjectDrawer } from './ui/ObjectDrawer';
import { ObjectControlPanel } from './ui/ObjectControlPanel';
import { OBJECT_SCALE_STEP } from './config/constants';

const sceneContainer = document.getElementById('scene')!;
const { scene, camera, renderer } = createSceneBundle(sceneContainer);

buildTray(scene);
const water = new WaterSurface(scene, renderer);
const sand = new SandHeightfield(scene);
const orbitCamera = new OrbitCamera(camera);

const registry = new ObjectRegistry();
const factory = new ObjectFactory();
const selection = new SelectionController();
const raycast = new RaycastService(camera, sand.mesh, () => registry.allGroups());
const actionLog = new NoopActionLogSink();

const toastEl = document.getElementById('toast')!;
const toast = new Toast(toastEl);
const hintPanel = new HintPanel(document.getElementById('hint')!);
const drawerEl = document.getElementById('drawer')!;
const objctlEl = document.getElementById('objctl')!;

const stateMachine = new InputStateMachine({
  scene,
  raycast,
  sand,
  registry,
  selection,
  camera: orbitCamera,
  factory,
  actionLog,
  onPlacingStateChange: (loading) => {
    if (loading) toast.show('載入模型中…');
  },
  onObjectPlaced: (placed) => {
    if (placed.isPlaceholderFallback) toast.show('此物件模型載入失敗，暫以佔位符顯示');
    // 一次選擇只放置一個：放完就清除選定的物件種類，之後的點擊不會一直冒出同款物件；
    // 要再放一個，回物件抽屜再點一次即可。
    stateMachine.placeKind = null;
    drawer.clearPick();
  },
});

// 塑沙後的物件重新沉降由 InputStateMachine.resettleNear 處理（只沉降筆刷附近的物件）；
// 不在這裡訂閱 sand.onChanged 對全場重算，否則會抵銷塑沙節流的效能優化。

const drawer = new ObjectDrawer(drawerEl, {
  onPick: (kindId) => {
    stateMachine.placeKind = kindId;
  },
});

const objectControlPanel = new ObjectControlPanel(objctlEl, {
  onRotate: (dir) => {
    const s = selection.selected;
    if (!s) return;
    s.group.rotation.y += dir * (Math.PI / 12);
    actionLog.emit({ type: 'object.transform', timestamp: Date.now(), placedId: s.id, rotationY: s.group.rotation.y });
  },
  onFlip: () => {
    const s = selection.selected;
    if (!s) return;
    s.flipped = !s.flipped;
    applyTransform(s);
    objectControlPanel.show(s);
    actionLog.emit({ type: 'object.transform', timestamp: Date.now(), placedId: s.id, flipped: s.flipped });
  },
  onCycleLie: () => {
    const s = selection.selected;
    if (!s) return;
    const next: Record<typeof s.lieState, typeof s.lieState> = {
      stand: 'lieFront',
      lieFront: 'lieBack',
      lieBack: 'lieSide',
      lieSide: 'stand',
    };
    s.lieState = next[s.lieState];
    s.group.rotation.x = s.lieState === 'lieFront' ? Math.PI / 2 : s.lieState === 'lieBack' ? -Math.PI / 2 : 0;
    s.group.rotation.z = s.lieState === 'lieSide' ? Math.PI / 2 : 0;
    settleObject(s, raycast, sand);
    objectControlPanel.show(s);
    actionLog.emit({ type: 'object.transform', timestamp: Date.now(), placedId: s.id, lieState: s.lieState });
  },
  onBury: (dir) => {
    const s = selection.selected;
    if (!s) return;
    const maxBury = objectHeight(s) * 0.8;
    // 只能往下埋（最多八成高度）、最高回到沙面（0），不允許浮空
    s.buryOffset = Math.max(-maxBury, Math.min(0, s.buryOffset + dir * 0.5));
    settleObject(s, raycast, sand);
    actionLog.emit({ type: 'object.transform', timestamp: Date.now(), placedId: s.id, buryOffset: s.buryOffset });
  },
  onScale: (dir) => {
    const s = selection.selected;
    if (!s) return;
    s.scale = Math.max(0.4, Math.min(2.5, s.scale + dir * OBJECT_SCALE_STEP));
    applyTransform(s);
    settleObject(s, raycast, sand);
    actionLog.emit({ type: 'object.transform', timestamp: Date.now(), placedId: s.id, scale: s.scale });
  },
  onDelete: () => {
    const s = selection.selected;
    if (!s) return;
    scene.remove(s.group);
    registry.remove(s.id);
    for (const child of registry.childrenOf(s.id)) settleObject(child, raycast, sand);
    selection.select(null);
    actionLog.emit({ type: 'object.delete', timestamp: Date.now(), placedId: s.id });
  },
});

selection.onChange((placed) => objectControlPanel.show(placed));

function applyMode(mode: Mode): void {
  stateMachine.setMode(mode);
  drawer.show(mode === 'place');
  if (mode !== 'place') drawer.clearPick();
  hintPanel.setMode(mode);
  toast.show(toastForMode(mode));
}

// macOS 自然捲動使用者的滾輪/右鍵拖曳方向反轉設定（persist 在 localStorage）
const INVERT_KEY = 'sandtray.invertScroll';
let invertScroll = localStorage.getItem(INVERT_KEY) === '1';

// 匯出視角預設（theta=方位角, phi=仰角, dist=距離；沙盤記錄慣例是多方位拍攝）
const EXPORT_VIEWS: Record<Exclude<ExportView, 'current'>, { theta: number; phi: number; dist: number }> = {
  top: { theta: 0, phi: 0.06, dist: 95 },
  front: { theta: 0, phi: 1.15, dist: 105 },
  back: { theta: Math.PI, phi: 1.15, dist: 105 },
  left: { theta: Math.PI / 2, phi: 1.15, dist: 110 },
  right: { theta: -Math.PI / 2, phi: 1.15, dist: 110 },
  isoLeft: { theta: Math.PI / 4, phi: 0.9, dist: 105 },
  isoRight: { theta: -Math.PI / 4, phi: 0.9, dist: 105 },
};

function exportWithView(view: ExportView): void {
  if (view !== 'current') {
    const v = EXPORT_VIEWS[view];
    const target = new THREE.Vector3(0, -1, 0);
    camera.position.set(
      target.x + v.dist * Math.sin(v.phi) * Math.sin(v.theta),
      target.y + v.dist * Math.cos(v.phi),
      target.z + v.dist * Math.sin(v.phi) * Math.cos(v.theta),
    );
    camera.lookAt(target);
  }
  exportPng(renderer, scene, camera);
  orbitCamera.refresh(); // 還原使用者原本的視角
  toast.show('已匯出沙盤影像');
}

new Toolbar(document.getElementById('toolbar')!, {
  onModeChange: applyMode,
  onExport: exportWithView,
  onToggleInvertScroll: () => {
    invertScroll = !invertScroll;
    localStorage.setItem(INVERT_KEY, invertScroll ? '1' : '0');
    toast.show(invertScroll ? '已反轉滾輪與右鍵拖曳方向' : '已恢復預設滾動方向');
    return invertScroll;
  },
  isScrollInverted: () => invertScroll,
});
applyMode('orbit');

attachPointerTracker(renderer.domElement, {
  onDown: (p) => stateMachine.onDown(p),
  onMove: (p) => stateMachine.onMove(p),
  onUp: () => stateMachine.onUp(),
  onWheelZoom: (f, p) => stateMachine.onWheelZoom(f, p),
  onPinchZoom: (f, p) => stateMachine.onPinchZoom(f, p),
  onPan: (dx, dy) => stateMachine.onPan(dx, dy),
  isScrollInverted: () => invertScroll,
});

(function loop(t?: number) {
  requestAnimationFrame(loop);
  water.update(t ?? 0);
  renderer.render(scene, camera);
})();
