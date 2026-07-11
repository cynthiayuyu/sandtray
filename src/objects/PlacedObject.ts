import * as THREE from 'three';

let nextId = 1;

/**
 * 立起、或朝兩個不同的軸躺倒——躺下不是只有單一姿勢，例如十字架/船躺倒時，
 * 前後躺（繞 X 軸）和左右躺（繞 Z 軸）會露出不同的「面」，讓使用者可以選擇
 * 比較自然的那個方向，而不是永遠只有一種躺法。
 */
export type LieState = 'stand' | 'lieX' | 'lieZ';

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
  isPlaceholderFallback: boolean;

  constructor(kindId: string, group: THREE.Group, isPlaceholderFallback: boolean) {
    this.id = `obj_${nextId++}`;
    this.kindId = kindId;
    this.group = group;
    this.isPlaceholderFallback = isPlaceholderFallback;
    group.userData.placedId = this.id;
  }
}
