/**
 * 把 GLTF/GLB 模型的動畫與骨架資料剝除成輕量靜態模型。
 *
 * 為什麼需要：Quaternius 的動物模型內嵌動畫軌道與 skinning 資料，單檔約 3MB；
 * 沙盤不播動畫，但這些資料讓每次 raycast（拖曳物件時每個 pointermove 都會發生）
 * 變得非常慢，也拖慢首次載入。剝除後輸出 .glb，體積縮到原本的幾十分之一。
 *
 * 用法：node scripts/strip-animations.mjs <輸入.gltf|.glb> <輸出.glb>
 */
import { NodeIO } from '@gltf-transform/core';
import { prune, dedup, weld, simplify, quantize } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error('usage: node scripts/strip-animations.mjs <in.gltf|in.glb> <out.glb>');
  process.exit(1);
}

const io = new NodeIO();
const doc = await io.read(input);
const root = doc.getRoot();

for (const anim of root.listAnimations()) {
  // 先個別 dispose channel/sampler，anim.dispose() 本身不會連帶清掉 sampler，
  // 導致 sampler 引用的動畫關鍵影格 accessor 全部變成清不掉的殘留（單檔多出 1MB+）
  for (const channel of anim.listChannels()) channel.dispose();
  for (const sampler of anim.listSamplers()) sampler.dispose();
  anim.dispose();
}
for (const skin of root.listSkins()) skin.dispose();
// SkinnedMesh 的頂點屬性 JOINTS/WEIGHTS 已無用，prune 前先移除
for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    for (const semantic of prim.listSemantics()) {
      if (semantic.startsWith('JOINTS_') || semantic.startsWith('WEIGHTS_')) {
        prim.setAttribute(semantic, null);
      }
    }
  }
}

// 減面到約 1/4 並量化頂點屬性：低多邊形風格下視覺差異極小，但 raycast/載入成本大幅下降
await doc.transform(
  prune(),
  dedup(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.25, error: 0.001 }),
  quantize(),
);
await io.write(output, doc);
console.log(`written: ${output}`);
