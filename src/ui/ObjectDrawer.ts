import { categoriesWithEntries, entriesByCategory, searchCatalog } from '../catalog/catalog.index';
import { CATEGORY_LABELS, type Category, type CatalogEntry } from '../catalog/types';
import { catalogData } from '../catalog/catalog.data';

export interface ObjectDrawerCallbacks {
  onPick(kindId: string): void;
}

type TabKey = Category | 'all';

/** 分類頁籤 + 搜尋框 + 格狀清單，取代雛形中寫死的一排物件按鈕 */
export class ObjectDrawer {
  private activeTab: TabKey = 'all';
  private query = '';
  private pickedId: string | null = null;
  private readonly el: HTMLElement;
  private readonly callbacks: ObjectDrawerCallbacks;

  constructor(el: HTMLElement, callbacks: ObjectDrawerCallbacks) {
    this.el = el;
    this.callbacks = callbacks;
    this.render();
  }

  show(visible: boolean): void {
    this.el.classList.toggle('show', visible);
  }

  clearPick(): void {
    this.pickedId = null;
    this.render();
  }

  private currentEntries(): CatalogEntry[] {
    if (this.query.trim()) return searchCatalog(this.query);
    return this.activeTab === 'all' ? catalogData : entriesByCategory(this.activeTab);
  }

  private render(): void {
    this.el.innerHTML = '';

    const searchRow = document.createElement('div');
    searchRow.className = 'search-row';
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = '搜尋物件…';
    input.value = this.query;
    input.oninput = () => {
      this.query = input.value;
      this.renderGridOnly();
    };
    searchRow.appendChild(input);
    this.el.appendChild(searchRow);

    const tabs = document.createElement('div');
    tabs.className = 'tabs';
    const tabList: TabKey[] = ['all', ...categoriesWithEntries()];
    tabList.forEach((tab) => {
      const btn = document.createElement('button');
      btn.className = 'tab' + (tab === this.activeTab ? ' on' : '');
      btn.textContent = tab === 'all' ? '全部' : CATEGORY_LABELS[tab];
      btn.onclick = () => {
        this.activeTab = tab;
        this.query = '';
        input.value = '';
        this.render();
      };
      tabs.appendChild(btn);
    });
    this.el.appendChild(tabs);

    const grid = document.createElement('div');
    grid.className = 'grid';
    this.el.appendChild(grid);
    this.renderGrid(grid);
  }

  private renderGridOnly(): void {
    const grid = this.el.querySelector('.grid');
    if (grid instanceof HTMLElement) this.renderGrid(grid);
  }

  private renderGrid(grid: HTMLElement): void {
    grid.innerHTML = '';
    const entries = this.currentEntries();
    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = '找不到符合的物件';
      grid.appendChild(empty);
      return;
    }
    entries.forEach((entry) => {
      const btn = document.createElement('button');
      btn.className = 'obj-btn' + (entry.id === this.pickedId ? ' picked' : '');
      btn.innerHTML = `<span class="ic">${entry.icon ?? '❖'}</span>${entry.label}`;
      btn.onclick = () => {
        this.pickedId = entry.id;
        this.renderGridOnly();
        this.callbacks.onPick(entry.id);
      };
      grid.appendChild(btn);
    });
  }
}
