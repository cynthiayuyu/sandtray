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
  onWheelZoom(factor: number): void;
  /** 雙指手勢的縮放比例（>1 手指分開/拉遠，<1 手指靠攏/拉近），由呼叫端決定要拿來縮鏡頭還是縮物件 */
  onPinchZoom(factor: number): void;
}

function toPoint(clientX: number, clientY: number): PointerPoint {
  return {
    clientX,
    clientY,
    ndc: new THREE.Vector2((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1),
  };
}

/** 統一滑鼠/觸控（含雙指縮放）事件，轉成正規化的 PointerPoint 給呼叫端使用 */
export function attachPointerTracker(el: HTMLElement, handlers: PointerHandlers): void {
  let pinchDist = 0;

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
      return;
    }
    handlers.onDown(eventPoint(e));
  }

  function move(e: MouseEvent | TouchEvent): void {
    if ('touches' in e && e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      if (pinchDist > 0) handlers.onPinchZoom(pinchDist / d);
      pinchDist = d;
      return;
    }
    if ('touches' in e) e.preventDefault();
    handlers.onMove(eventPoint(e));
  }

  function up(): void {
    pinchDist = 0;
    handlers.onUp();
  }

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
      handlers.onWheelZoom(1 + Math.sign(e.deltaY) * 0.08);
    },
    { passive: false },
  );
}
