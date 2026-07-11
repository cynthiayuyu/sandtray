import * as THREE from 'three';
import {
  CAMERA_DEFAULT,
  CAMERA_MIN_PHI,
  CAMERA_MAX_PHI,
  CAMERA_MIN_DIST,
  CAMERA_MAX_DIST,
  TRAY_W,
  TRAY_D,
} from '../config/constants';

/**
 * 手動球座標視角軌道（不依賴 OrbitControls）：theta/phi 為方位角/仰角，dist 為與 target 的距離。
 */
export class OrbitCamera {
  private theta = CAMERA_DEFAULT.theta;
  private phi = CAMERA_DEFAULT.phi;
  private dist = CAMERA_DEFAULT.dist;
  private readonly target = new THREE.Vector3(0, -1, 0);
  private readonly camera: THREE.PerspectiveCamera;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.update();
  }

  /** 拖曳位移套用到方位角/仰角 */
  applyDelta(dx: number, dy: number): void {
    this.theta -= dx * 0.0072;
    this.phi -= dy * 0.0072;
    this.update();
  }

  /** 滾輪/雙指縮放，factor>1 拉遠、<1 拉近 */
  zoom(factor: number): void {
    this.dist *= factor;
    this.update();
  }

  /**
   * 朝著游標/雙指中心點縮放：拉近時把視角中心（target）逐步移向該點，讓使用者可以
   * 對著沙盤邊緣/角落放大細看，而不是永遠只能繞著沙盤正中央縮放。拉遠時則不移動
   * target，避免視角中心被拖得太遠。hitPoint 為 null（游標沒有落在沙面上，例如
   * 對著沙盤外的背景滾動）時退回原本的定點縮放。
   */
  zoomToward(hitPoint: THREE.Vector3 | null, factor: number): void {
    if (hitPoint && factor < 1) {
      const shift = 1 - factor;
      this.target.lerp(hitPoint, shift);
      this.target.x = Math.max(-TRAY_W / 2, Math.min(TRAY_W / 2, this.target.x));
      this.target.z = Math.max(-TRAY_D / 2, Math.min(TRAY_D / 2, this.target.z));
    }
    this.zoom(factor);
  }

  private update(): void {
    this.phi = Math.max(CAMERA_MIN_PHI, Math.min(CAMERA_MAX_PHI, this.phi));
    this.dist = Math.max(CAMERA_MIN_DIST, Math.min(CAMERA_MAX_DIST, this.dist));
    this.camera.position.set(
      this.target.x + this.dist * Math.sin(this.phi) * Math.sin(this.theta),
      this.target.y + this.dist * Math.cos(this.phi),
      this.target.z + this.dist * Math.sin(this.phi) * Math.cos(this.theta),
    );
    this.camera.lookAt(this.target);
  }
}
