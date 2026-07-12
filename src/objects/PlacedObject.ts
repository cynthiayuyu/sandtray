import * as THREE from 'three';

let nextId = 1;

/**
 * 立起、或朝不同方向躺倒。躺下不是只有單一姿勢——人物需要「趴」和「仰躺」兩種，
 * 十字架/船等物件前後倒與側倒露出的面也不同，所以提供四種姿勢循環：
 * 立起 → 前趴（繞 X +90°）→ 仰躺（繞 X -90°）→ 側躺（繞 Z 90°）→ 立起。
 */
export type LieState = 'stand' | 'lieFront' | 'lieBack' | 'lieSide';

/**
 * 已放置在沙盤中的一個物件實例。group 是實際的 THREE.Group（掛在 scene 底下的平行節點，
 * 疊放關係只用 stackParentId 這個軟關聯表示，不做 Three.js 的父子節點掛載——
 * 理由見 README「疊放設計決策」：避免縮放/旋轉父物件時連帶影響站在上面的物件。
 */
export class PlacedObject {
  readonly id: string;
  readonly kindId: string;
  readonly group: THREE.Group;
  stackParentId: string | null = null;
  scale = 1;
  flipped = false;
  lieState: LieState = 'stand';
  /**
   * 埋沙位移（≤0）：沙遊中「埋藏」是重要的表達方式，允許把物件往下埋進沙裡；
   * 但不允許正值——物件浮在半空中違反沙盤的物理隱喻，會干擾治療詮釋。
   */
  buryOffset = 0;
  isPlaceholderFallback: boolean;

  constructor(kindId: string, group: THREE.Group, isPlaceholderFallback: boolean) {
    this.id = `obj_${nextId++}`;
    this.kindId = kindId;
    this.group = group;
    this.isPlaceholderFallback = isPlaceholderFallback;
    group.userData.placedId = this.id;
  }
}
