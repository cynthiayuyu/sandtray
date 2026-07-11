import * as THREE from 'three';
import { tree } from './tree';
import { pine } from './pine';
import { person } from './person';
import { house } from './house';
import { rock } from './rock';
import { boat } from './boat';
import { placeholder } from './placeholder';

export type ProceduralBuilder = () => THREE.Group;

/** 程序化物件建構器登錄表：catalog 的 visualSource.builderKey 對應到這裡的 key */
export const ProceduralBuilderRegistry: Record<string, ProceduralBuilder> = {
  tree,
  pine,
  person,
  house,
  rock,
  boat,
  placeholder,
};
