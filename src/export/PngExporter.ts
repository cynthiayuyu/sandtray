import * as THREE from 'three';

export function exportPng(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void {
  renderer.render(scene, camera);
  const a = document.createElement('a');
  a.download = `sandtray-${new Date().toISOString().slice(0, 10)}.png`;
  a.href = renderer.domElement.toDataURL('image/png');
  a.click();
}
