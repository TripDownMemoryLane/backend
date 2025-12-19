# 📞 Quiz API 接口文件

本文件詳細說明了 `quiz-api` 後端伺服器提供的所有 API 接口、預期輸入和成功回應格式。

---

## 1. 🟢 健康檢查 ( GET / )

用於確認伺服器是否正常運行和前後端連線狀態。

| 屬性 | 說明 |
| :--- | :--- |
| **URL** | `GET http://localhost:4001/` |
| **Header** | 無特殊要求 |

**成功回應 (200 OK):**
```json
{
    "message": "接上接上咯 XD XD XD ！🎉🎉🎊🎊",
    "endpoint": "this is GET / router"
}
```


## 2. 🖼️ 生成家庭故事 ( POST /generate-story )
此接口接收 Base64 圖片數據，並利用 AI 服務為每張圖片生成一段簡短的家庭故事。

| 屬性 | 說明 |
| :--- | :--- |
| **URL** | `POST http://localhost:4001/generate-story` |
| **Header** | `Content-Type: application/json` |


### **請求格式 (Body)**

```json
{
    "images": [
        "data:image/png;base64,iVBORw0KGgoAAAANSUEUgAA...", // 第一張圖片的 Base64
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",// 第二張圖片的 Base64
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..." // 第三張圖片 Base64
    ]
}
```

**成功回應 (200 OK):**
```json
{
    "success": true,
    "message": "Successfully generated stories!",
    "stories": [
        "這是第一張圖片的故事",
        "這是第二張圖片的故事",
        "這是第三張圖片的故事"
    ]
}
```



## 3. 📝 生成測驗與語音 ( POST /generate-quiz )
此接口接收 AI 或使用者提供的家庭故事陣列，生成測驗題目、選項、答案，並將題目文本轉換為 Base64 編碼的語音 (`audioBase64`)。

| 屬性 | 說明 |
| :--- | :--- |
| **URL** | `POST http://localhost:4001/generate-quiz` |
| **Header** | `Content-Type: application/json` |


### **請求格式 (Body)**

```json
{
    "stories": [
        "這是第一個故事的文本，用於生成題目。", 
        "這是第二個故事的文本，用於生成題目。",
        "這是第三個故事的文本，用於生成題目。"
    ]
}
```

**成功回應 (200 OK):**
```json
{
    "success": true,
    "message": "Successfully generated quiz questions and audio!",
    "questions": [
        {
            "question": "在聖誕晚餐派對中，誰抱著小華?",
            "options": ["爸爸", "媽媽", "女兒莉莉", "外公"],
            "answer": "爸爸",
            "audioBase64": "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAATGBW/z/k+..." // Base64 編碼的 MP3 音頻
        },
        // ... 更多題目
    ]
}
```





## 🖼️ 前端圖片轉 Base64 方法

這展示了前端如何將圖片轉換為 Base64，並依序呼叫兩個 API 接口以獲取帶語音的題目。


### 📸 輔助函數：圖片轉換為 Base64
```javascript
const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};
```


### 🔧使用範例
```javascript
// 多張圖片轉換
const handleImageUpload = async (event) => {
    const files = event.target.files; 
    
    // 1. 先轉換所有圖片
    const base64Array = await Promise.all(
        Array.from(files).map(file => convertToBase64(file))
    );
    
    // 2. 準備發送數據
    const requestData = base64Array.map(base64 => ({
        title: base64,
        description: "這張照片個故事故事敘述敘述敘述，使用者回答"
    }));
    
    // 3. 發送到後端
    const response = await fetch('http://localhost:4001/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    });
    
    return await response.json();
};
```
