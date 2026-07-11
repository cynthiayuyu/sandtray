/**
 * 第二期縫隙（尚未實作）：物件的象徵意義註記，只有治療師模式能看到。
 *
 * 刻意獨立成檔案、以 catalogId 外鍵關聯，絕不內嵌進 CatalogEntry（見 catalog/types.ts），
 * 這樣個案模式的程式碼路徑完全不需要、也不應該碰到這支檔案。
 *
 * 本期沒有任何程式碼 import 這支檔案，只是先把型別定義好。第二期實作時，
 * 應該只允許 mode/AppMode.ts 的 getAppMode()==='therapist' 分支動態 import() 這裡的資料，
 * 且理想上治療師模式應該是獨立的 build/route，讓個案端連網路請求都不會拿到這份資料，
 * 而不只是在 UI 上隱藏起來。
 */
export interface SymbolicAnnotation {
  catalogId: string;
  meaning: string;
  therapistNotes?: string;
}

export type AnnotationLookup = Map<string, SymbolicAnnotation>;

// 第二期實作時在此填入資料，本期維持空白。
export const annotations: AnnotationLookup = new Map();
