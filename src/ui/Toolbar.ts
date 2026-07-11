import type { Mode } from '../interaction/InputStateMachine';
import { MODE_ICONS, MODE_LABELS, MODE_TOASTS } from './ModeStrings';

const MODES: Mode[] = ['orbit', 'raise', 'dig', 'place'];

export interface ToolbarCallbacks {
  onModeChange(mode: Mode): void;
  onExport(): void;
}

export class Toolbar {
  private readonly el: HTMLElement;
  private readonly callbacks: ToolbarCallbacks;

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
        this.callbacks.onModeChange(mode);
      };
      this.el.appendChild(btn);
    });

    const exportBtn = document.createElement('button');
    exportBtn.className = 'tool';
    exportBtn.innerHTML = '<span class="ic">📷</span>匯出';
    exportBtn.onclick = () => this.callbacks.onExport();
    this.el.appendChild(exportBtn);
  }
}

export function toastForMode(mode: Mode): string {
  return MODE_TOASTS[mode];
}
