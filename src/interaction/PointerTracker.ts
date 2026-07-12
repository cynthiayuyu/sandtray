import * as THREE from 'three';

export interface PointerPoint {
  clientX: number;
  clientY: number;
  ndc: THREE.Vector2;
}

export interface PointerHandlers {
  onDown(p: PointerPoint): void;
  onMove(p: PointerPoint): void;
  onUp(): void;
  /** factor: >1 拉遠、<1 拉近；point 為滾輪游標所在位置，用來支援「朝游標處縮放」 */
  onWheelZoom(factor: number, point: PointerPoint): void;
  /** 雙指手勢的縮放比例（>1 手指分開/拉遠，<1 手指靠攏/拉近），point 為兩指中點，由呼叫端決定要拿來縮鏡頭還是縮物件 */
  onPinchZoom(factor: number, point: PointerPoint): void;
  /** 平移視角中心的螢幕像素位移（右鍵拖曳／Shift+拖曳／雙指拖曳觸發） */
  onPan(dx: number, dy: number): void;
  /**
   * 是否反轉滑鼠滾輪與右鍵拖曳的方向。macOS 的「自然捲動」設定會讓滾輪方向與
   * 傳統滑鼠相反，使用者可用 UI 開關切換，不用去改系統設定。只影響滑鼠事件，
   * 觸控手勢（雙指縮放/平移）方向本來就跟著手指走，不受此設定影響。
   */
  isScrollInverted(): boolean;
}

function toPoint(clientX: number, clientY: number): PointerPoint {
  return {
    clientX,
    clientY,
    ndc: new THREE.Vector2((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1),
  };
}

/** 統一滑鼠/觸控（含雙指縮放、平移）事件，轉成正規化的 PointerPoint 給呼叫端使用 */
export function attachPointerTracker(el: HTMLElement, handlers: PointerHandlers): void {
  let pinchDist = 0;
  let pinchMidX = 0;
  let pinchMidY = 0;
  let panning = false;
  let panLastX = 0;
  let panLastY = 0;

  function eventPoint(e: MouseEvent | TouchEvent): PointerPoint {
    if ('touches' in e && e.touches.length) {
      return toPoint(e.touches[0].clientX, e.touches[0].clientY);
    }
    const m = e as MouseEvent;
    return toPoint(m.clientX, m.clientY);
  }

  function down(e: MouseEvent | TouchEvent): void {
    if ('touches' in e && e.touches.length === 2) {
      pinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      pinchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      pinchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      return;
    }
    if (!('touches' in e) && (e.button === 2 || e.shiftKey)) {
      panning = true;
      panLastX = e.clientX;
      panLastY = e.clientY;
      return;
    }
    handlers.onDown(eventPoint(e));
  }

  function move(e: MouseEvent | TouchEvent): void {
    if ('touches' in e && e.touches.length === 2) {
      e.preventDefault();
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      if (pinchDist > 0) handlers.onPinchZoom(pinchDist / d, toPoint(midX, midY));
      handlers.onPan(midX - pinchMidX, midY - pinchMidY);
      pinchDist = d;
      pinchMidX = midX;
      pinchMidY = midY;
      return;
    }
    if (panning && !('touches' in e)) {
      const dir = handlers.isScrollInverted() ? -1 : 1;
      handlers.onPan((e.clientX - panLastX) * dir, (e.clientY - panLastY) * dir);
      panLastX = e.clientX;
      panLastY = e.clientY;
      return;
    }
    if ('touches' in e) e.preventDefault();
    handlers.onMove(eventPoint(e));
  }

  function up(): void {
    pinchDist = 0;
    panning = false;
    handlers.onUp();
  }

  el.addEventListener('contextmenu', (e) => e.preventDefault());
  el.addEventListener('mousedown', down);
  addEventListener('mousemove', move);
  addEventListener('mouseup', up);
  el.addEventListener('touchstart', down, { passive: false });
  el.addEventListener('touchmove', move, { passive: false });
  addEventListener('touchend', up);
  el.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const dir = handlers.isScrollInverted() ? -1 : 1;
      handlers.onWheelZoom(1 + Math.sign(e.deltaY) * dir * 0.08, toPoint(e.clientX, e.clientY));
    },
    { passive: false },
  );
}
