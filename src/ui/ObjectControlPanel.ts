import type { PlacedObject } from '../objects/PlacedObject';

export interface ObjectControlCallbacks {
  onRotate(dir: 1 | -1): void;
  onFlip(): void;
  /** 循環切換立起／前趴／仰躺／側躺，見 PlacedObject.LieState */
  onCycleLie(): void;
  onScale(dir: 1 | -1): void;
  /** 埋入沙中(-1)／抬回沙面(+1)。只能往下埋、不能浮空，見 PlacedObject.buryOffset */
  onBury(dir: 1 | -1): void;
  /** 複製選取的物件（放在旁邊），不用回物件庫再翻找一次 */
  onDuplicate(): void;
  onDelete(): void;
}

const LIE_TITLES: Record<PlacedObject['lieState'], string> = {
  stand: '躺下（前趴）',
  lieFront: '仰躺',
  lieBack: '側躺',
  lieSide: '立起',
};

/** 選取物件時顯示的側邊控制面板：旋轉／翻轉／躺姿／縮放／埋沙／刪除 */
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
    this.lieBtn = mkBtn('🛌', '躺下（前趴）', () => this.callbacks.onCycleLie());
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

    const bury = mkBtn('▼', '埋入沙中', () => this.callbacks.onBury(-1));
    const lift = mkBtn('▲', '抬回沙面', () => this.callbacks.onBury(1));
    this.el.append(bury, lift);

    const dup = mkBtn('⧉', '複製這個物件', () => this.callbacks.onDuplicate());
    this.el.appendChild(dup);

    const sep3 = document.createElement('div');
    sep3.className = 'sep';
    this.el.appendChild(sep3);

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
