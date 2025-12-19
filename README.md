# 🚀 Quiz API 專案 (Express Backend)

歡迎使用 **Quiz API** 專案！這是一個基於 **Express** 的後端伺服器，專門設計用於接收 Base64 編碼的圖片，透過 AI 進行**故事生成**及**測驗題目生成**（生成題目也將**轉換為語音**後回傳）。

---

## 🤖 使用的 AI 技術與額度

| 服務 | 用途 | 
| :--- | :--- | 
| **Google Vision API** | 圖片分析處理。 | 
| **Google Cloud Text-to-Speech (TTS)** | 將生成的題目文字轉換為 Base64 音頻。 | 
| **Hugging Face Inference API** | 文字生成 (故事/題目) 及圖片分析輔助。 | 


- 由於是免費版，將會有次數限制，上限大約為（Google Vision & Google Cloud 1,000/月; Hugging Face 130/月）

## ⚙️ 埠號（Port）設定要求

為確保前後端服務能夠正常通訊與運作，請**嚴格遵守**以下埠號設定：

> * **前端 (REACT)：** `4000`
> * **後端 (API)：** `4001`

---

## 🛠️ 快速開始：啟動後端 API 步驟

### 1. 📂 取得專案與安裝依賴

#### 1.1. 克隆專案
```bash
git clone https://github.com/TripDownMemoryLane/quiz-api.git
cd quiz-api
```

#### 1.2. 安裝依賴套件
```bash
npm install
```


### 2. 🔑 設定 API 密鑰 (.env 檔案)
#### 2.1. 獲取 Hugging Face API Key
- **註冊並獲取 Key：** 請到 [Hugging Face 網站](https://huggingface.co/settings/tokens) 註冊帳號，並在設定 "Access Tokens" 頁面生成自己的 **API Token**。

#### 2.2. 獲取 Google Cloud API Key
1. **註冊 Google Cloud**： 前往 [Google Cloud 網站](https://cloud.google.com/?hl=en) 註冊帳號。
2. **建立專案**： 前往 [專案](https://console.cloud.google.com/)「新增專案」並建立。
3. **啟用 Vision API**： 進入新專案，到 [Vision API](https://console.cloud.google.com/apis/library/vision.googleapis.com) 頁面，點擊 「啟用 Enable」。
4. **啟用 Text-to-Speech API**： 進入新專案，到 [TTS API](https://console.cloud.google.com/apis/library/texttospeech.googleapis.com) 頁面，點擊 「啟用 Enable」。
5. **建立金鑰**： 前往 [憑證頁面](https://console.cloud.google.com/apis/credentials) $\rightarrow$ 「建立憑證」 $\rightarrow$ 「API 金鑰」，並複製生成的 Key。

#### 2.3. .env 檔案內容

在 quiz-api 資料夾內創建 .env 文件，並填入密鑰：

```.env
HF_API_KEY="你的HuggingFace_Access_Token"
GOOGLE_API_KEY="你的Google Vision Key"
```


### 3. 🚀 啟動伺服器
```bash
npm start
```

- 伺服器將運行在：http://localhost:4001


## 📞 其他 markdown
- **API.md** : 解釋每個 API 的輸入輸出值及怎麽使用
- **progress.md** ：專案進度追蹤

   
