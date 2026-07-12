import type { Mode } from '../interaction/InputStateMachine';

export const MODE_LABELS: Record<Mode, string> = {
  orbit: '視角',
  raise: '堆沙',
  dig: '挖沙',
  place: '物件',
};

export const MODE_ICONS: Record<Mode, string> = {
  orbit: '👁',
  raise: '⛰',
  dig: '🌊',
  place: '✦',
};

export const MODE_HINTS: Record<Mode, string> = {
  orbit: '拖曳旋轉視角，滾輪／雙指縮放\n右鍵拖曳／Shift+拖曳／雙指拖曳可平移\n點一下選取物件，選取後再拖曳可移動',
  raise: '在沙面上拖曳堆高',
  dig: '在沙面上拖曳挖深，見到藍色即是水',
  place: '先選一個物件，再點沙面放置（一次放一個）\n從空白處拖曳仍可轉視角',
};

export const MODE_TOASTS: Record<Mode, string> = {
  orbit: '拖曳旋轉視角，點一下選取物件',
  raise: '在沙面上拖曳堆高',
  dig: '在沙面上拖曳挖深，見到藍色即是水',
  place: '選一個物件、點沙面放置，一次放一個',
};
