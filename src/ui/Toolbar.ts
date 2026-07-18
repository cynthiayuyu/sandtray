import type { Mode } from '../interaction/InputStateMachine';
import { MODE_ICONS, MODE_LABELS, MODE_TOASTS } from './ModeStrings';

const MODES: Mode[] = ['orbit', 'raise', 'dig', 'place'];

/** 匯出視角（沙盤記錄慣例是多方位拍攝）：目前視角、俯視、四個正方位、兩個斜角 */
export type ExportView =
  | 'current'
  | 'top'
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'isoLeft'
  | 'isoRight';

const EXPORT_VIEW_LABELS: Array<[ExportView, string]> = [
  ['current', '目前視角'],
  ['top', '正俯視'],
  ['front', '正面'],
  ['back', '背面'],
  ['left', '左側'],
  ['right', '右側'],
  ['isoLeft', '左斜 45°'],
  ['isoRight', '右斜 45°'],
];

/** 視角快速切換：俯視、斜角（從長邊 45° 看，最常見的沙盤觀察角度） */
export type ViewPreset = 'top' | 'angle';

export interface ToolbarCallbacks {
  onModeChange(mode: Mode): void;
  onExport(view: ExportView): void;
  /** 快速切換觀察視角（切換後仍可自由旋轉/縮放） */
  onViewPreset(view: ViewPreset): void;
  /** 切換滑鼠滾輪/右鍵拖曳方向反轉（macOS 自然捲動使用者用），回傳切換後的狀態 */
  onToggleInvertScroll(): boolean;
  isScrollInverted(): boolean;
}

export class Toolbar {
  private readonly el: HTMLElement;
  private readonly callbacks: ToolbarCallbacks;
  private exportMenu: HTMLElement | null = null;

  constructor(el: HTMLElement, callbacks: ToolbarCallbacks) {
    this.el = el;
    this.callbacks = callbacks;
    this.render();
  }

  private render(): void {
    this.el.innerHTML = '';
    MODES.forEach((mode) => {
      const btn = document.createElement('button');
      btn.className = 'tool' + (mode === 'orbit' ? ' on' : '');
      btn.dataset.mode = mode;
      btn.innerHTML = `<span class="ic">${MODE_ICONS[mode]}</span>${MODE_LABELS[mode]}`;
      btn.onclick = () => {
        this.el.querySelectorAll('.tool[data-mode]').forEach((x) => x.classList.toggle('on', x === btn));
        this.hideExportMenu();
        this.callbacks.onModeChange(mode);
      };
      this.el.appendChild(btn);
    });

    const topBtn = document.createElement('button');
    topBtn.className = 'tool';
    topBtn.innerHTML = '<span class="ic">⬇️</span>俯視';
    topBtn.title = '從正上方觀察沙盤';
    topBtn.onclick = () => this.callbacks.onViewPreset('top');
    this.el.appendChild(topBtn);

    const angleBtn = document.createElement('button');
    angleBtn.className = 'tool';
    angleBtn.innerHTML = '<span class="ic">📐</span>斜角';
    angleBtn.title = '從長邊 45° 斜角觀察（最常見的角度）';
    angleBtn.onclick = () => this.callbacks.onViewPreset('angle');
    this.el.appendChild(angleBtn);

    const exportBtn = document.createElement('button');
    exportBtn.className = 'tool';
    exportBtn.innerHTML = '<span class="ic">📷</span>匯出';
    exportBtn.onclick = () => this.toggleExportMenu(exportBtn);
    this.el.appendChild(exportBtn);

    const invertBtn = document.createElement('button');
    invertBtn.className = 'tool' + (this.callbacks.isScrollInverted() ? ' on' : '');
    invertBtn.innerHTML = '<span class="ic">🖱</span>反轉滾輪';
    invertBtn.title = 'macOS 自然捲動使用者：反轉滾輪縮放與右鍵拖曳的方向';
    invertBtn.onclick = () => {
      const inverted = this.callbacks.onToggleInvertScroll();
      invertBtn.classList.toggle('on', inverted);
    };
    this.el.appendChild(invertBtn);
  }

  private toggleExportMenu(anchor: HTMLElement): void {
    if (this.exportMenu) {
      this.hideExportMenu();
      return;
    }
    const menu = document.createElement('div');
    menu.id = 'exportmenu';
    EXPORT_VIEW_LABELS.forEach(([view, label]) => {
      const item = document.createElement('button');
      item.textContent = label;
      item.onclick = () => {
        this.hideExportMenu();
        this.callbacks.onExport(view);
      };
      menu.appendChild(item);
    });
    const rect = anchor.getBoundingClientRect();
    menu.style.left = `${rect.left + rect.width / 2}px`;
    menu.style.bottom = `${innerHeight - rect.top + 8}px`;
    document.body.appendChild(menu);
    this.exportMenu = menu;
  }

  private hideExportMenu(): void {
    this.exportMenu?.remove();
    this.exportMenu = null;
  }
}

export function toastForMode(mode: Mode): string {
  return MODE_TOASTS[mode];
}
