# 線上沙盤・沙遊治療工具

給心理治療師使用的網頁版沙遊治療（sandplay therapy）工具。個案在瀏覽器裡用滑鼠或手指塑沙、放置象徵物件，完成一次沙盤創作；治療師則可即時觀察、匯出畫面存檔。

這份文件記錄專案的架構與關鍵設計決策，讓之後接手的工程師（包含未來的你）不用重新猜一遍「為什麼是這樣做」。

## 目前狀態（第一期）與路線圖（第二期）

**第一期（本次，已完成）：**

- 國際沙遊治療協會標準規格沙盤（72×57×7 cm、內側藍底見水）
- 3D 視角旋轉／縮放、堆沙／挖沙（高度場）
- 物件放置／拖曳／旋轉／翻轉／躺下立起／縮放／刪除／疊放
- 視角模式下「點一下選取、選取後再拖曳才移動」，修正誤觸
- 物件庫分類頁籤 + 搜尋
- 可插拔的 GLB/GLTF 外部模型載入架構（本期未附真實素材檔案，見〈GLB 素材〉）
- PNG 匯出、手機觸控支援

**第二期（尚未實作，架構已預留縫隙）：**

- 治療師模式／個案模式：治療師可查看物件的象徵意義註記，個案模式下完全不可見
- 治療師後台：擺放歷程記錄、軌跡回放、統計分析（需要帳號系統與資料庫）

原始的單檔雛形保留在 [`legacy/sandtray-prototype.html`](legacy/sandtray-prototype.html) 作為歷史對照，不再維護。

## 快速開始

```bash
npm install
npm run dev        # 本機開發伺服器
npm run typecheck  # 只跑 TypeScript 型別檢查
npm run build      # 型別檢查 + 打包到 dist/
npm run preview    # 預覽打包結果
```

部署：push 到 `main` 分支會觸發 `.github/workflows/deploy.yml`，build 後部署到 GitHub Pages（需在 repo 的 Settings → Pages 把來源設為「GitHub Actions」）。`vite.config.ts` 裡的 `REPO_NAME` 常數要對齊實際的 repo 名稱（大小寫敏感），否則 Pages 上的資源路徑會 404。

## 架構地圖

```
src/
├── main.ts                # composition root：組裝所有模組、掛上事件、跑 RAF 迴圈
├── config/constants.ts    # 沙盤尺寸、網格解析度、相機/縮放夾限範圍
├── scene/                 # 場景/燈光/沙盤木框/水面
├── sand/                  # 沙面高度場（塑形核心）
├── camera/                # 手動球座標視角軌道
├── objects/                # 物件的資料模型、程序化建構器、GLTF 載入、疊放沉降邏輯
│   └── builders/           # 6 種低多邊形程序化物件 + 佔位符
├── catalog/                # 物件目錄（分類/搜尋用的資料與索引）
├── interaction/            # 點選/拖曳/疊放的核心狀態機、raycast、選取狀態
├── ui/                      # 工具列、物件抽屜、物件控制面板等 DOM 組件
├── export/                  # PNG 匯出
├── history/                 # 第二期縫隙：擺放歷程事件抽象
└── mode/                    # 第二期縫隙：治療師/個案模式旗標
```

模組邊界慣例：`ui/` 底下的模組不直接 import three.js，只透過 `objects/`、`interaction/`、`export/` 提供的介面操作場景；這樣 UI 程式碼可以獨立於渲染細節之外閱讀/修改。

## 設計決策

### 為什麼沙面用「高度場」而不是體素／Marching Cubes

沙面（`sand/SandHeightfield.ts`）是一張 `PlaneGeometry`，每個頂點的 Y 值就是那一格的沙高，`heightAt(x,z)` 直接查最近格點，`sculpt()` 用高斯筆刷加減頂點高度。這是典型的「高度場」表示法。

沙盤實體只有 7 公分深，治療師的操作永遠是「由上往下」塑形丘陵、河谷，不會、也不需要做出洞穴或懸垂結構——真的要體驗這件事的話，用手在真沙上做不到，數位版也沒必要支援。高度場是單層 2D 網格，記憶體與運算成本遠低於三維體素網格，`sculpt`/`heightAt` 都是 O(1) 或 O(格數) 的簡單查表/遍歷，不需要 marching cubes 抽取等值面那種較重的運算。對這個使用情境來說，高度場是把複雜度换成夠用的務實選擇。

### 物件目錄 schema 與 procedural／GLTF 可插拔設計

`catalog/types.ts` 的 `CatalogEntry.visualSource` 是一個 discriminated union：`{type:'procedural', builderKey}` 或 `{type:'gltf', url, scale?, yOffset?}`。`objects/ObjectFactory.ts` 依這個欄位分派到 `builders/` 裡的程序化函式，或是 `GltfObjectLoader`（包 `THREE.GLTFLoader`，以 URL 做 Promise cache，避免重複下載/解析同一個檔案；每次放置回傳的是 clone 出來的獨立實例）。

這代表未來要接上 Quaternius、Kenney 等 CC0 低多邊形素材包時，只需要在 `catalog/catalog.data.ts` 新增資料（`visualSource: {type:'gltf', url:'assets/models/xxx.glb'}`），完全不用動任何互動或 UI 程式碼。GLTF 載入失敗（本期故意放了一筆指向不存在檔案的示範項目 `demo_gltf_tree` 來驗證這條路徑）時，`ObjectFactory` 會 fallback 到程序化的 `placeholder` 物件並跳出提示，讓物件庫即使部分素材缺失也不會壞掉。

### GLB 素材

`public/assets/models/` 底下依素材包分資料夾（`kenney-mini-characters/`、`kenney-nature/`、`kenney-graveyard/`、`kenney-mini-dungeon/`、`kenney-survival/`、`kenney-watercraft/`、`quaternius-animals/`），目前放了一批 CC0 授權的低多邊形模型（來自 Kenney.nl 與 Quaternius，涵蓋人物/動物/植物/自然物/建築/交通工具/宗教神話/幻想生物），對應到 `catalog/catalog.data.ts` 裡標示「（模型）」或明確物件名稱（如「橡樹（模型）」「幽靈」）的項目。

**為什麼是「依素材包」分資料夾，而不是依物件分類分資料夾**：Kenney 的部分素材包（mini-characters、graveyard-kit、mini-dungeon、survival-kit、watercraft-pack）用一張共用的材質圖 `Textures/colormap.png`（相對於 `.glb` 檔案本身的路徑）貼所有模型；如果把不同素材包的模型混放進同一個依「分類」命名的資料夾（例如把 graveyard-kit 的骷髏和 mini-dungeon 的半獸人都放進 `fantasy/`），兩包各自的 `Textures/colormap.png` 會互相覆蓋、貼錯材質。依素材包分資料夾可以讓每包自帶的材質圖路徑维持正確，不同分類的物件依然可以透過 `catalog.data.ts` 的 `category` 欄位自由歸類，跟實際檔案擺放位置無關。

之後要繼續擴充：取得授權允許的 CC0 低多邊形素材 → 放進 `public/assets/models/<素材包名稱>/`（記得連同該素材包引用的外部材質/貼圖一起複製，材質遺失時 GLTFLoader 只會在 console 印警告、模型仍會載入但貼圖是空的）→ 在 `catalog/catalog.data.ts` 新增對應的 `CatalogEntry`。`demo_gltf_tree` 這筆項目仍保留、故意指向不存在的檔案，用來驗證「載入失敗→優雅降級為佔位符」這條路徑沒有被後續的真實素材蓋掉。

已知取捨：Quaternius 的動物模型（`quaternius-animals/`）因為內嵌了動畫資料，單檔約 3MB，比其他幾KB～數百KB的素材重不少；目前沒有播放動畫（GLTFLoader 只取靜態姿勢），之後如果要瘦身，可以用 gltf-transform 之類的工具把動畫軌道剝除。

### 視角模式的點選/拖曳/疊放互動狀態機

雛形版本裡，視角模式下只要點到物件就會立刻選取並開始拖曳，很容易在單純想轉視角時誤觸物件。`interaction/InputStateMachine.ts` 把這件事改成兩段式手勢：

- 點一下**尚未選取**的物件 → 只選取，不拖曳
- 點一下**已經選取**的物件 → 這次按住可以拖曳移動
- 拖曳起點在物件上但物件尚未被選取 → 視為要轉視角，而不是拖走物件
- 點空沙面（無位移）→ 清除選取

物件模式（`place`）維持「點物件即可立刻拖曳」的行為不變，因為使用者在該模式下本來就是在操作物件，不像視角模式是隨手轉鏡頭。**這個手勢設計是本次的主要建議方案，不是唯一解——實際請治療師試用後，如果兩段式手勢還是容易誤觸或不夠直覺，可以考慮加一個明確的「鎖定選取」切換鈕作為備案。**

疊放的判定：`interaction/RaycastService.hitFromAbove(x,z,excludeGroup)` 從正上方垂直向下 raycast，判斷該處正下方的承載面是沙面還是另一個物件（取最近命中點，即「疊放在最高點」）。`objects/settle.ts` 的 `settleObject()` 把這個結果套用到物件位置，並記錄 `PlacedObject.stackParentId` 這個軟關聯——**刻意不用 Three.js 的父子節點掛載**，因為如果把站在岩石上的人真的掛到岩石的 local space 底下，之後縮放/旋轉岩石會連帶讓人變形/旋轉，這在治療情境裡會扭曲個案擺放的意義，不應該發生。取而代之的是每次塑沙、拖曳、縮放後都重新對疊放物件跑一次 `settleObject`（「重新沉降」），承載物消失或移走時會優雅地退回沙面高度。

### 旋轉/縮放/翻轉，不做自由旋轉萬向支架

`ui/ObjectControlPanel.ts` 只提供離散控制：Y 軸（yaw）15° 步進旋轉、翻轉（鏡像，`scale.x *= -1`）、躺下/立起切換（`rotation.x` 在 0 與 90° 間切換）、縮放 ±。沒有做自由拖曳的旋轉萬向支架（gizmo）。

沙遊物件的方向本身常帶有象徵意義（一個人是站著還是躺著、面朝哪個方向，治療師會特別留意），自由旋轉容易產生「看起來壞掉」或無意義的姿勢，而且自由旋轉的 gizmo 互動會跟既有的點選/拖曳 raycast 邏輯打架，複雜度不成比例。離散控制集是更簡單、也更適合這個情境的取捨。

### 治療師模式／個案模式的結構性隔離（第二期縫隙）

`mode/AppMode.ts` 定義 `AppMode = 'client' | 'therapist'`，本期 `getAppMode()` 恆回傳 `'client'`。物件的象徵意義註記型別定義在**獨立檔案** `catalog/annotations.therapist-only.ts`，用 `catalogId` 外鍵關聯，**絕不**內嵌進 `CatalogEntry`（可見的目錄中繼資料）裡。本期沒有任何程式碼 import 這支檔案。

這個隔離特意做在檔案層級而不是「UI 隱藏某個欄位」，是因為第二期要滿足的是硬性需求：個案絕對不能看到治療師的註記。第二期實作時，應該只讓 `getAppMode()==='therapist'` 的分支動態 `import()` 這支檔案，且理想上治療師模式應該是獨立的 build 或路由，讓個案端連網路請求都不會拿到這份資料，而不只是在 DOM 裡藏起來（藏起來仍然可能被瀏覽器開發工具看到）。

### 歷程記錄（第二期縫隙）

`history/ActionLog.ts` 定義 `ActionLogSink` 介面（`emit(event)`），本期所有會改變沙盤狀態的操作（塑沙、放置、搬動、縮放、旋轉、刪除）都已經呼叫 `actionLog.emit(...)`，但目前接的是什麼都不做的 `NoopActionLogSink`。第二期要做歷程記錄／軌跡回放／統計分析時，只需要換一個真正會寫進資料庫的 `ActionLogSink` 實作，呼叫端完全不用改。這部分涉及個案隱私，需要帳號系統與資料庫，屆時另行設計，本期只保證「事件會發生，接口已經存在」。

## 已知限制與後續工作

- GLB 素材已填入一批 Quaternius／Kenney 的 CC0 低多邊形模型（見〈GLB 素材〉），但仍只是初步挑選，可能需要依實際使用再調整每個模型的 `visualSource.scale`（可用物件控制面板的縮放鈕暫時手動修正）
- 視角模式的兩段式選取手勢是待與治療師實測驗證的 UX 決策，不是定案
- 旋轉/翻轉/躺下的離散控制集是刻意的簡化，如果之後發現需要更自由的擺放角度，需要重新評估要不要導入 gizmo 型互動
- 水面反光目前用 PMREM 生成的簡易環境貼圖 + `MeshPhysicalMaterial` 的 clearcoat，不是即時反射/折射管線；如果之後想要更真實的水面效果，可以評估 `THREE.Reflector` 之類的做法，但要留意效能成本
- 尚未寫自動化測試（本期靠 `npm run typecheck`/`npm run build` 加上手動瀏覽器操作驗證）

## 開發規範

- TypeScript 開啟 `strict` 模式，`tsconfig.json` 另外開了 `erasableSyntaxOnly`（禁止建構子參數屬性簡寫等「非純型別擦除」語法）與 `verbatimModuleSyntax`（型別 import 一律要寫 `import type`）
- `ui/` 模組不得直接 import three.js，只能透過 `objects/`、`interaction/`、`export/`、`scene/` 暴露的介面操作場景
- 新增物件：優先在 `catalog/catalog.data.ts` 加資料，不要新增新的互動邏輯分支
