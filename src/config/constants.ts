// 沙盤內側尺寸（單位＝公分），依國際沙遊治療協會標準規格 72×57×7
export const TRAY_W = 72;
export const TRAY_D = 57;
export const TRAY_WALL = 7;

// 沙面網格解析度
export const SEG_X = 120;
export const SEG_Z = 96;

export const SAND_TOP = 0; // 沙面預設高度
export const FLOOR = -5.6; // 藍底（可挖深度）
export const MAX_H = 7.5; // 堆沙上限

// 相機軌道夾限範圍
export const CAMERA_MIN_PHI = 0.18;
export const CAMERA_MAX_PHI = 1.42;
export const CAMERA_MIN_DIST = 14;
export const CAMERA_MAX_DIST = 220;
export const CAMERA_DEFAULT = { theta: 0.62, phi: 0.98, dist: 105 };

// 物件縮放夾限
export const OBJECT_MIN_SCALE = 0.4;
export const OBJECT_MAX_SCALE = 2.5;
export const OBJECT_SCALE_STEP = 0.1;

// 拖曳/點擊判定閾值（NDC 螢幕像素位移總和）
export const DRAG_MOVE_THRESHOLD = 5;
