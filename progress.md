# 📊 專案進度表 (Progress Tracking)

本文件反映當前專案的實現狀態，包含已完成功能、當前待解決問題，以及未來的開發規劃。

---

## 🎯 專案核心功能目標
建立一個完整的測驗生成系統，流程包含：**圖片上傳 → 故事生成 → 題目生成 → 語音轉換 → 回傳完整測驗數據**。

---

## ✅ 已完成功能 (實現並已整合到主架構)

### 🔧 基礎架構與服務
* [x] Express 伺服器設置與啟動
* [x] CORS 跨域配置 (限定埠號 4000)
* [x] **服務邏輯分離：** `aiService.js` (文字生成), `audioService.js` (語音 TTS), `server.js` (路由)

### 📡 API 端點與數據流
* [x] `GET /` - 健康檢查端點
* [x] `POST /generate-story` - 實現 **圖片接收 $\rightarrow$ 故事生成** 邏輯
* [x] `POST /generate-quiz` - 實現 **故事接收 $\rightarrow$ 題目生成 $\rightarrow$ 語音轉換** 呼叫
* [x] Base64 圖片數據接收及驗證
* [x] 成功/錯誤回應格式統一

### 🔗 AI 與外部服務整合
* [x] Hugging Face API (HF) 整合與金鑰管理
* [x] Google Vision API 整合 (圖片分析)
* [x] Google Cloud Text-to-Speech (TTS) REST API 整合 (語音轉換)

### 📝 文件與規範
* [x] README.md 更新 (包含 TTS 設定要求)
* [x] API.md 文件編寫 (包含雙步驟 API 接口)
* [x] 埠號配置說明 (4000/4001)

---

## 🚧 當前進度狀態與待優化項目

### 🧠 AI 生成穩定性與優化
| 狀態 | 描述 |
| :--- | :--- |
| **完成** | 故事生成邏輯 (圖片分析後生成情境故事) |
| **完成** | 題目生成邏輯 (根據故事生成選擇題) |
| **待優化**| **AI 輸出 JSON 穩定性：** **需要更嚴格的 Prompt 糾正**，以確保 AI 只回傳純淨的 JSON 內容，避免伺服器解析失敗。 |

### 🎤 語音服務穩定性 (關鍵問題)
| 狀態 | 描述 |
| :--- | :--- |
| **完成** | 語音轉換服務程式碼實現 (`audioService.js`) |
| **已修復** | Node.js 內建錯誤 (`console is not a function`) |
| **待解決** | **TTS 轉換失敗：** 服務器回傳 `audioBase64: null`。需要解決 Google TTS API 權限或語音名稱錯誤（`Voice '...' does not exist`）的問題。|

---

## 🎯 待開發與未來規劃

* [ ] **錯誤處理精確化：** 針對不同的 AI 服務錯誤 (HF 配額用完、Vision/TTS 權限不足) 提供更具體的錯誤訊息。
* [ ] 答案驗證邏輯
* [ ] 問題難度/主題分級系統
* [ ] 答案解釋生成

---

## 🚀 現在進展可實現流程 (當前狀態):

圖片 (Base64) $\xrightarrow{\text{POST /generate-story}}$ 故事 (Text) $\xrightarrow{\text{POST /generate-quiz}}$ 題目 (Text) + **語音 (Null)** $\xrightarrow{\text{前端接收}}$ 前端顯示題目 (無語音)