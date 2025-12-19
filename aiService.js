require('dotenv').config();
const { HfInference } = require('@huggingface/inference');
const axios = require('axios');
const imageSize = require('image-size');

// ----------------------
// 初始化 HF 
// ----------------------
if (!process.env.HF_TOKEN) {
    throw new Error("HF_TOKEN is not set in environment variables.");
}
const hf = new HfInference(process.env.HF_TOKEN);
const CHAT_MODEL = 'Qwen/Qwen2.5-7B-Instruct'; 


// ----------------------
// Base64 圖片 → Buffer
// ----------------------
function base64ToBuffer(base64DataUrl) {
    const parts = base64DataUrl.split(';base64,');
    if (parts.length !== 2) {
        throw new Error("Invalid Base64 Data URI format in base64ToBuffer");
    }
    return Buffer.from(parts[1], 'base64');
}

// ----------------------
// 圖片分析邏輯 
// ----------------------
async function analyzeImageWithGoogleVision(imageBuffer) {
    try {
        console.log("圖片分析...");

        const base64 = imageBuffer.toString("base64");

        const response = await axios.post(
            `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_API_KEY}`,
            {
                requests: [
                    {
                        image: { content: base64 },
                        features: [
                            { type: "LABEL_DETECTION", maxResults: 5 },
                            { type: "FACE_DETECTION", maxResults: 5 },
                            { type: "LANDMARK_DETECTION", maxResults: 3 },
                            { type: "OBJECT_LOCALIZATION", maxResults: 5 }
                        ]
                    }
                ]
            },
            { timeout: 30000 }
        );

        const res = response.data.responses[0];

        const labels = res.labelAnnotations ? res.labelAnnotations.map(l => l.description).slice(0, 3) : [];
        const landmarks = res.landmarkAnnotations ? res.landmarkAnnotations.map(l => l.description).slice(0, 1) : [];
        const faceCount = res.faceAnnotations ? res.faceAnnotations.length : 0;
        const facesDescription = faceCount > 0 ? `${faceCount}個人物（${faceCount > 1 ? '群體照' : '單人照'}）` : '無明顯人物';

        // 結合所有資訊
        let analysisParts = [];
        if (landmarks.length > 0) {
             analysisParts.push(`地點: ${landmarks.join(', ')}`);
        }
        analysisParts.push(`人物: ${facesDescription}`);
        analysisParts.push(`場景/物件: ${labels.join(', ')}`);


        return `圖片分析重點: ${analysisParts.join('; ')}`;
    } catch (err) {

    }
}


// ----------------------------------------------------
//  1. POST /generate-story 邏輯
// ----------------------------------------------------
const STORY_SYSTEM_INSTRUCTION = `
你現在的任務是依照下列規則產生一句繁體中文的故事草稿。你必須「完全依照規則」，不可添加任何未在規則中允許的內容。

【輸出格式（這是強制格式，你必須完全遵守）】
你只能輸出一個句子，句子的格式必須完全相同如下：

（人物名字）在（地點）一起（當時正在做的事情），當時大家顯得（情緒），（活動目的）。

你只能修改四個部分：
1. （地點）  
   - 若圖片分析中有地點，必須翻譯成繁體中文後填入。  
   - 若無地點，則填入「（地點）」。

2. （當時正在做的事情）  
   - 若圖片分析中有明確活動，必須翻譯成繁體中文後填入。 
   - 若無明確活動，可進行推論並强制加上挂號，若無推論則必須填入「（當時正在做的事情）」。

3. （情緒）  
   - 若圖片分析有情緒，比如 Happiness，必須翻譯成繁體中文後填入。 
   - 若無明確活動，則填入「（情緒）」，不可擅自推論。

4. （活動目的）  
   - 永遠保持佔位符，不可自行生成內容。

【禁止規則（必須遵守）】
1. 不得自行產生人數資訊（如「5個人物」）。  
2. 不得自行產生情緒或目的內容。  
3. 不得加入任何英文詞彙。  
4. 不得忽略佔位符；所有未知資訊都必須使用括號佔位符。


【範例】
圖片分析：地點: Disneyland Park; 人物: 5人; 場景: Smile, Happiness  
你必須輸出：  
（人物名字）在迪士尼樂園一起（當時正在做的事情），當時大家顯得（情緒），並記錄下（此行的目的）。

【最終要求】
你只能輸出最終一句話，不得加入任何解釋。

`;


async function generateStoryFromImages(imageBase64Array) {
    let combinedPrompt = "請為以下圖片生成三個獨立的故事：\n";
/*
    const MOCK_ANALYSIS_RESULTS = [
        "圖片分析重點: 地點: Disneyland Park; 人物: 5個人物（群體照）; 場景/物件: People, Smile, Happiness",
        "圖片分析重點: 人物: 5個人物（群體照）; 場景/物件: People, Outerwear, Coat",
        "圖片分析重點: 地點: Trocadéro Gardens; 人物: 3個人物（群體照）; 場景/物件: Happiness, Smile, Leisure"
    ];
*/
    for (let i = 0; i < imageBase64Array.length; i++) {
        const base64Url = imageBase64Array[i];
        let imageAnalysis = "家庭照片";
        
        const imageBuffer = base64ToBuffer(base64Url);
        imageAnalysis = await analyzeImageWithGoogleVision(imageBuffer);
/*
        let imageAnalysis;
        if (i < MOCK_ANALYSIS_RESULTS.length) {
            imageAnalysis = MOCK_ANALYSIS_RESULTS[i];
        } else {
            imageAnalysis = "圖片分析重點: 默認家庭照片; 人物: 單人照; 場景/物件: 家居, 溫馨";
        }
*/
        console.log(`圖片 ${i + 1} 分析:`, imageAnalysis);

        combinedPrompt += ` 圖片${i + 1}內容分析: ${imageAnalysis}\n\n`;
    }
    
    // 增加 JSON 格式要求
    combinedPrompt += `\n請嚴格遵守輸出以下 JSON 格式：{"stories": ["故事1", "故事2", "故事3"]}`;

    try {
        const response = await hf.chatCompletion({
            model: CHAT_MODEL,
            messages: [
                { role: "system", content: STORY_SYSTEM_INSTRUCTION },
                { role: "user", content: combinedPrompt }
            ],
            max_tokens: 1500,
            temperature: 0.7
        });

        const aiResponse = response.choices[0].message.content;
        let cleanText = aiResponse.trim()
                                  .replace(/```json/gi, '')
                                  .replace(/```/gi, '')
                                  .trim();
        
        const match = cleanText.match(/\{[\s\S]*\}/);

        if (!match) {
            console.error("原始 AI 回應:", aiResponse);
            throw new Error("AI Story 回應格式錯誤，無法找到有效的 JSON 物件。");
        }

        // 3. 嘗試解析提取出來的 JSON 字串
        const jsonString = match[0];
        const jsonResponse = JSON.parse(jsonString); 
        
        if (!Array.isArray(jsonResponse.stories)) {
             throw new Error("AI 回應 JSON 中缺少 'stories' 陣列欄位。");
        }
        
        return jsonResponse.stories; // 返回 ['故事1', '故事2', '故事3']
        
    } catch (error) {
        console.error('❌ 生成故事失敗:', error);
        throw new Error(`AI 故事生成失敗: ${error.message}`);
    }
}


// ----------------------------------------------------
// 🎯 2. POST /generate-quiz 邏輯
// ----------------------------------------------------

const QUIZ_SYSTEM_INSTRUCTION = `
你是一位專門為長者設計簡單單選題的助手。

【任務】
根據使用者提供的三個故事內容，為每個故事生成一題單選題。

【題目規範】
1. 題目必須與故事內容直接相關，不做推測。
2. 題目簡單、清楚，適合長者理解。
3. 每題有三個選項，僅用文字描述，不要使用 A. / B. / C. 或其他標號。
4. 僅有一個正確答案。
5. 所有輸出內容必須完全使用繁體中文。
6. 不得使用稱謂（例如媽媽、爸爸、阿公、阿嬤），除非故事中明確提到特定人物名稱。

【JSON 輸出格式】
你只能輸出 JSON 陣列，格式如下：

[
  {
    "question": "題目內容（繁體中文）",
    "options": ["選項文字1", "選項文字2", "選項文字3"],
    "answer": "正確選項文字（必須與 options 中一致）"
  }
]

【禁止事項】
- 不得加入任何解釋或說明文字
- 不得加入額外符號或 Markdown 語法
- 不得加入程式碼區塊標記
- 不得輸出非 JSON 的文字
- 選項文字不得加標號，如 A. / B. / C.
`;



async function generateQuizFromStories(storyArray) {
    let combinedPrompt = "請根據以下三個故事，為每個故事生成一個選擇題：\n";

    for (let i = 0; i < storyArray.length; i++) {
        combinedPrompt += `故事${i + 1} 內容: ${storyArray[i]}\n\n`;
    }

    // JSON 格式說明
    combinedPrompt += `\n請輸出 JSON 陣列，每個物件包含: "question" (問題), "options" (選項陣列), "answer" (正確答案文字)。`;


    try {
        const response = await hf.chatCompletion({
            model: CHAT_MODEL,
            messages: [
                { role: "system", content: QUIZ_SYSTEM_INSTRUCTION },
                { role: "user", content: combinedPrompt }
            ],
            max_tokens: 1500,
            temperature: 0.7 
        });

        const aiResponse = response.choices[0].message.content;

        let cleanText = aiResponse.trim().replace(/```json/g, '').replace(/```/g, '').trim();
        const match = cleanText.match(/\[[\s\S]*\]/); // 找尋 JSON 陣列

        if (!match) throw new Error("AI Quiz 回應格式錯誤，無法解析 JSON 陣列。");

        const quizData = JSON.parse(match[0]);
        if (!Array.isArray(quizData)) {
            throw new Error("AI 回應格式錯誤，不是有效的 JSON 陣列。");
        }
        return quizData;

    } catch (error) {
        console.error('❌ 生成測驗失敗:', error);
        throw new Error(`AI 題目生成失敗: ${error.message}`);
    }
}


module.exports = { 
    generateStoryFromImages,
    generateQuizFromStories
};