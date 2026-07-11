import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { TRAY_W, TRAY_D, FLOOR } from '../config/constants';

/**
 * 水面（沙盤內側藍底）。使用 PMREM 生成的簡易環境貼圖讓水面有柔和反光，
 * 比即時反射/折射管線便宜許多，對這個尺度的沙盤已經足夠。
 */
export class WaterSurface {
  readonly mesh: THREE.Mesh;
  private readonly basePositions: Float32Array;

  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;

    const geo = new THREE.PlaneGeometry(TRAY_W, TRAY_D, 40, 32);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x2f6f8f,
      roughness: 0.18,
      metalness: 0.05,
      envMap: envTexture,
      envMapIntensity: 0.9,
      clearcoat: 0.5,
      clearcoatRoughness: 0.3,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = FLOOR + 0.4;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    this.basePositions = geo.attributes.position.array.slice() as Float32Array;
  }

  update(t: number): void {
    const pos = this.mesh.geometry.attributes.position;
    const b = this.basePositions;
    for (let i = 0; i < pos.count; i++) {
      const x = b[i * 3];
      const y = b[i * 3 + 1];
      pos.setZ(i, Math.sin(x * 0.35 + t * 0.0012) * Math.cos(y * 0.3 + t * 0.0009) * 0.16);
    }
    pos.needsUpdate = true;
  }
}
