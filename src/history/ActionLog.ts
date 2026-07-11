/**
 * 第二期縫隙（尚未實作）：擺放歷程記錄/回放/統計分析的事件抽象。本期呼叫端
 * （塑沙、放置、搬動、縮放、旋轉、刪除）都會 emit 事件進來，但預設的
 * NoopActionLogSink 什麼也不做——之後接上真正的後端（帳號系統／資料庫）時，
 * 只需要換一個 ActionLogSink 實作，呼叫端完全不用改。
 */
export interface SessionEvent {
  type:
    | 'sand.sculpt'
    | 'object.place'
    | 'object.move'
    | 'object.transform'
    | 'object.delete';
  timestamp: number;
  [key: string]: unknown;
}

export interface ActionLogSink {
  emit(event: SessionEvent): void;
}

export class NoopActionLogSink implements ActionLogSink {
  emit(_event: SessionEvent): void {
    // 本期不記錄任何歷程
  }
}
