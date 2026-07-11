/**
 * 第二期縫隙（尚未實作）：治療師模式／個案模式。本期恆為 'client'，且是安全預設值——
 * 任何目前的程式碼都不應該、也沒有分支會因為這個值變成 'therapist' 而洩漏
 * catalog/annotations.therapist-only.ts 的內容。
 */
export type AppMode = 'client' | 'therapist';

export function getAppMode(): AppMode {
  return 'client';
}
