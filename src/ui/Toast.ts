export class Toast {
  private timer: number | undefined;
  private readonly el: HTMLElement;

  constructor(container: HTMLElement) {
    this.el = container;
  }

  show(msg: string): void {
    this.el.textContent = msg;
    this.el.classList.add('show');
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.el.classList.remove('show'), 2600);
  }
}
