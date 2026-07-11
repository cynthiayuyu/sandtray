import * as THREE from 'three';

export interface SceneBundle {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

/** 建立場景、相機、渲染器與基本燈光；掛載 renderer 於 #scene 容器 */
export function createSceneBundle(container: HTMLElement): SceneBundle {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x241d17);
  scene.fog = new THREE.Fog(0x241d17, 160, 320);

  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.5, 600);

  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x5a4a3a, 0.55));
  const sun = new THREE.DirectionalLight(0xffeed8, 0.95);
  sun.position.set(-45, 70, 35);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -60;
  sc.right = 60;
  sc.top = 60;
  sc.bottom = -60;
  sc.far = 220;
  scene.add(sun);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  return { scene, camera, renderer };
}
