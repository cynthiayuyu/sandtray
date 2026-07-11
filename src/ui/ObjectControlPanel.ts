import type { PlacedObject } from '../objects/PlacedObject';

export interface ObjectControlCallbacks {
  onRotate(dir: 1 | -1): void;
  onFlip(): void;
  /** 循環切換立起／躺下（前後）／躺下（左右），見 PlacedObject.LieState */
  onCycleLie(): void;
  onScale(dir: 1 | -1): void;
  onDelete(): void;
}

const LIE_TITLES: Record<PlacedObject['lieState'], string> = {
  stand: '躺下',
  lieX: '躺下（另一面／再點一下）',
  lieZ: '立起',
};

/** 選取物件時顯示的側邊控制面板：旋轉／翻轉／躺下立起／縮放／刪除 */
export class ObjectControlPanel {
  private lieBtn!: HTMLButtonElement;
  private flipBtn!: HTMLButtonElement;
  private readonly el: HTMLElement;
  private readonly callbacks: ObjectControlCallbacks;

  constructor(el: HTMLElement, callbacks: ObjectControlCallbacks) {
    this.el = el;
    this.callbacks = callbacks;
    this.render();
  }

  show(placed: PlacedObject | null): void {
    this.el.classList.toggle('show', !!placed);
    if (placed) {
      this.lieBtn.classList.toggle('active', placed.lieState !== 'stand');
      this.lieBtn.title = LIE_TITLES[placed.lieState];
      this.flipBtn.classList.toggle('active', placed.flipped);
    }
  }

  private render(): void {
    this.el.innerHTML = '';

    const rotL = mkBtn('⟲', '左轉', () => this.callbacks.onRotate(1));
    const rotR = mkBtn('⟳', '右轉', () => this.callbacks.onRotate(-1));
    this.el.append(rotL, rotR);

    this.flipBtn = mkBtn('⇋', '翻轉', () => this.callbacks.onFlip());
    this.lieBtn = mkBtn('🛌', '躺下', () => this.callbacks.onCycleLie());
    this.el.append(this.flipBtn, this.lieBtn);

    const sep = document.createElement('div');
    sep.className = 'sep';
    this.el.appendChild(sep);

    const scaleUp = mkBtn('＋', '放大', () => this.callbacks.onScale(1));
    const scaleDown = mkBtn('－', '縮小', () => this.callbacks.onScale(-1));
    this.el.append(scaleUp, scaleDown);

    const sep2 = document.createElement('div');
    sep2.className = 'sep';
    this.el.appendChild(sep2);

    const del = mkBtn('✕', '移除', () => this.callbacks.onDelete());
    del.classList.add('del');
    this.el.appendChild(del);
  }
}

function mkBtn(icon: string, title: string, onclick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.textContent = icon;
  btn.title = title;
  btn.onclick = onclick;
  return btn;
}
