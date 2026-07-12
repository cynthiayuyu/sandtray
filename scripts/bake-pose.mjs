/**
 * 把指定動畫「第 0 影格」的骨架姿勢烘焙進頂點，再剝除動畫/骨架，輸出輕量靜態 GLB。
 *
 * 為什麼需要：剝除骨架後模型會停在綁定姿勢（T/A-pose，雙手張開），對沙遊人物來說
 * 很不自然。這個腳本先把骨架擺到動畫（例如 Idle_Neutral）的第一個影格，離線做一次
 * 線性混合蒙皮（LBS）把姿勢算進 POSITION/NORMAL，之後就不再需要骨架資料。
 *
 * 用法：node scripts/bake-pose.mjs <輸入.gltf> <輸出.glb> [動畫名稱=Idle_Neutral]
 */
import { NodeIO } from '@gltf-transform/core';
import { prune, dedup, quantize } from '@gltf-transform/functions';
import { Matrix4, Vector3, Quaternion } from 'three';

const [, , input, output, animName = 'Idle_Neutral'] = process.argv;
if (!input || !output) {
  console.error('usage: node scripts/bake-pose.mjs <in.gltf> <out.glb> [animationName]');
  process.exit(1);
}

const io = new NodeIO();
const doc = await io.read(input);
const root = doc.getRoot();

// 1) 把目標動畫第 0 影格的 TRS 套到各個骨架節點
const anim = root.listAnimations().find((a) => a.getName() === animName);
if (!anim) {
  console.error(`animation "${animName}" not found; available:`, root.listAnimations().map((a) => a.getName()));
  process.exit(1);
}
for (const channel of anim.listChannels()) {
  const node = channel.getTargetNode();
  const path = channel.getTargetPath();
  const out = channel.getSampler()?.getOutput();
  if (!node || !out) continue;
  const el = [];
  out.getElement(0, el);
  if (path === 'translation') node.setTranslation([el[0], el[1], el[2]]);
  else if (path === 'rotation') node.setRotation([el[0], el[1], el[2], el[3]]);
  else if (path === 'scale') node.setScale([el[0], el[1], el[2]]);
}

// 2) 對每個 skinned mesh 做離線 LBS，把姿勢寫進頂點
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  const skin = node.getSkin();
  if (!mesh || !skin) continue;

  const joints = skin.listJoints();
  const ibmAccessor = skin.getInverseBindMatrices();
  const meshWorld = new Matrix4().fromArray(node.getWorldMatrix());
  const invMeshWorld = meshWorld.clone().invert();

  // jointMatrix_j = invMeshWorld * jointWorld_j * IBM_j
  const jointMatrices = joints.map((joint, j) => {
    const ibm = [];
    ibmAccessor.getElement(j, ibm);
    const jw = new Matrix4().fromArray(joint.getWorldMatrix());
    return new Matrix4().multiplyMatrices(invMeshWorld, jw).multiply(new Matrix4().fromArray(ibm));
  });

  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION');
    const nrm = prim.getAttribute('NORMAL');
    const jnt = prim.getAttribute('JOINTS_0');
    const wgt = prim.getAttribute('WEIGHTS_0');
    if (!pos || !jnt || !wgt) continue;

    const v = new Vector3();
    const n = new Vector3();
    const acc = new Vector3();
    const nacc = new Vector3();
    const tmp = new Vector3();
    const skinned = new Matrix4();
    const zero = new Matrix4().set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const scaled = new Matrix4();
    const p = [];
    const nn = [];
    const j4 = [];
    const w4 = [];

    for (let i = 0; i < pos.getCount(); i++) {
      pos.getElement(i, p);
      jnt.getElement(i, j4);
      wgt.getElement(i, w4);

      skinned.copy(zero);
      for (let k = 0; k < 4; k++) {
        const w = w4[k];
        if (!w) continue;
        scaled.copy(jointMatrices[j4[k]]);
        for (let e = 0; e < 16; e++) skinned.elements[e] += scaled.elements[e] * w;
      }

      v.set(p[0], p[1], p[2]).applyMatrix4(skinned);
      acc.copy(v);
      pos.setElement(i, [acc.x, acc.y, acc.z]);

      if (nrm) {
        nrm.getElement(i, nn);
        // 法線用 skinning 矩陣的旋轉縮放部分近似（transformDirection 內含 normalize）
        n.set(nn[0], nn[1], nn[2]).transformDirection(skinned);
        nacc.copy(n);
        tmp.copy(nacc);
        nrm.setElement(i, [tmp.x, tmp.y, tmp.z]);
      }
    }

    prim.setAttribute('JOINTS_0', null);
    prim.setAttribute('WEIGHTS_0', null);
  }
}

// 3) 清除動畫與骨架（sampler 要逐一 dispose，見 strip-animations.mjs 的教訓）
for (const a of root.listAnimations()) {
  for (const channel of a.listChannels()) channel.dispose();
  for (const sampler of a.listSamplers()) sampler.dispose();
  a.dispose();
}
for (const skin of root.listSkins()) skin.dispose();

await doc.transform(prune(), dedup(), quantize());
await io.write(output, doc);
console.log(`written: ${output}`);
