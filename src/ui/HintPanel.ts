import type { Mode } from '../interaction/InputStateMachine';
import { MODE_HINTS } from './ModeStrings';

export class HintPanel {
  private readonly el: HTMLElement;

  constructor(el: HTMLElement) {
    this.el = el;
  }

  setMode(mode: Mode): void {
    this.el.textContent = MODE_HINTS[mode];
  }
}
