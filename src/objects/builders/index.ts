import * as THREE from 'three';
import { tree } from './tree';
import { pine } from './pine';
import { person } from './person';
import { house } from './house';
import { rock } from './rock';
import { boat } from './boat';
import { placeholder } from './placeholder';
import { burningCampfire } from './burningCampfire';
import { bigTree, sapling, tallPine, fruitTree } from './extraTrees';
import { sun, moon, star, torii } from './religiousSymbols';
import { snake } from './snake';
import { bird } from './bird';
import { horse } from './horse';
import { turtle } from './turtle';
import { cross } from './cross';
import { stupa } from './stupa';
import { candle } from './candle';
import { mushroomHouse } from './mushroomHouse';
import { crystal } from './crystal';
import { flower } from './flower';
import { bridge } from './bridge';
import { car } from './car';

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
  burningCampfire,
  bigTree,
  sapling,
  tallPine,
  fruitTree,
  sun,
  moon,
  star,
  torii,
  snake,
  bird,
  horse,
  turtle,
  cross,
  stupa,
  candle,
  mushroomHouse,
  crystal,
  flower,
  bridge,
  car,
};
