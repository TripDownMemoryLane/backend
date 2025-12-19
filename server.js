// server.js (優化版)
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
// 引入新的 AI 服務
const { generateStoryFromImages, generateQuizFromStories } = require('./aiService'); 
// 引入新的語音服務
const { addAudioToQuiz } = require('./audioService'); 

const app = express();
const port = 4001; 


// ----------------------------------------------------
// 工具函數
// ----------------------------------------------------
// Input: string (Base64 Data URI)
// Output: string (Base64 data part)
function extractBase64Data(base64DataUrl) {
    try {
        // Validation and extraction logic (不變)
        if (!base64DataUrl || typeof base64DataUrl !== 'string' || !base64DataUrl.startsWith('data:')) {
            throw new Error('Format of Base64 is incorrect (Format should be "data: ...")');
        }
        const parts = base64DataUrl.split(';base64,');
        if (parts.length !== 2) {
            throw new Error('Format of Base64 is incorrect (Missing ";base64,")');
        }
        if (parts[1].length === 0) {
            throw new Error('Base64 data is empty.');
        }
        
        // 確保 Base64 資料是乾淨的
        return parts[1].replace(/(\r\n|\n|\r| )/gm, ''); 
        
    } catch (e) {
        console.error("Base64 convert error:", e.message);
        throw new Error(`Invalid Base64 format: ${e.message}`);
    }
}


// ----------------------------------------------------
// CORS 配置 & 中間件
// ----------------------------------------------------
const corsOptions = {
    origin: 'http://localhost:4000', 
    methods: 'GET,POST',
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// Base64 is generally limited to 50mb
app.use(express.json({ limit: '50mb' }));


// ----------------------------------------------------
// 1. GET 測試 API： http://localhost:4001/ 
// ----------------------------------------------------
app.get('/', (req, res) => {
    console.log('* GET /');
    res.status(200).json({
        message: '接上接上咯 XD XD XD ！🎉🎉🎊🎊',
        endpoint: 'this is GET / router',
    });
});


// ----------------------------------------------------
// 2. POST 生成故事 API： /generate-story
// input：{ images: ['base64_1', 'base64_2', 'base64_3'] }
// output：{ success: true, stories: [ '故事1', '故事2', '故事3' ] }
// ----------------------------------------------------
app.post('/generate-story', async (req, res) => {
    console.log('POST /generate-story');
    const { images } = req.body;
    const validatedImages = [];

    // 1. 驗證輸入格式
    if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Wrong JSON format',
            message: 'Input should be { images: ["Base64_1", "Base64_2", "Base64_3"] }.',
        });
    }

    // 2. 驗證 Base64 圖片並清洗數據
    for (let i = 0; i < images.length; i++) {
        const imageBase64 = images[i];
        try {
            // 提取 Base64 數據部分
            extractBase64Data(imageBase64); 
            validatedImages.push(imageBase64);
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Base64 Data',
                message: `Image at index ${i} has invalid Base64 format.`,
                details: e.message,
                invalidItem: imageBase64 ? imageBase64.substring(0, 50) + '...' : 'Empty',
            });
        }
    }
    
    // 3. 呼叫 AI 服務生成故事
    try {
        console.log(`發送 ${validatedImages.length} 張圖片給 AI 生成故事...`);
        const stories = await generateStoryFromImages(validatedImages);

        res.status(200).json({
            success: true,
            message: 'Successfully generated stories!',
            stories: stories, 
        });
        
    } catch (error) {
        console.error("AI Story Generation Failed:", error);
        res.status(500).json({
            success: false,
            error: 'AI Generation Failed',
            message: 'Cannot generate story, please check your AI service or API key.',
            details: error.message
        });
    }
});


// ----------------------------------------------------
// 3. POST 生成題目+語音 API： /generate-quiz
// input：{ stories: ['故事1', '故事2', '故事3'] }
// output：{ success: true, questions: [ {question: '...', answer: '...', audioBase64: '...'} ] }
// ----------------------------------------------------
app.post('/generate-quiz', async (req, res) => {
    console.log('POST /generate-quiz');
    const { stories } = req.body;

    // 1. 驗證輸入格式
    if (!Array.isArray(stories) || stories.length === 0 || stories.some(s => typeof s !== 'string' || s.length === 0)) {
        return res.status(400).json({
            success: false,
            error: 'Wrong JSON format',
            message: 'Input should be { stories: ["Story 1", "Story 2", "Story 3"] } with non-empty strings.',
        });
    }

    // 2. 呼叫 AI 服務生成題目
    let quizArray;
    try {
        console.log(`發送 ${stories.length} 個故事給 AI 生成測驗題目...`);
        quizArray = await generateQuizFromStories(stories);
    } catch (error) {
        console.error("AI Quiz Generation Failed:", error);
        return res.status(500).json({
            success: false,
            error: 'AI Generation Failed',
            message: 'Cannot generate quiz, please check your AI service or API key.',
            details: error.message
        });
    }
    
    // 3. 呼叫 Audio 服務生成語音
    try {
        console.log('開始為所有題目生成語音...');
        const finalQuiz = await addAudioToQuiz(quizArray);
        
        res.status(200).json({
            success: true,
            message: 'Successfully generated quiz questions and audio!',
            questions: finalQuiz,
        });
        
    } catch (error) {
        console.error("Audio Generation Failed:", error);
        res.status(500).json({
            success: false,
            error: 'Audio Generation Failed',
            message: 'Cannot generate audio for questions, please check your TTS setup (GOOGLE_APPLICATION_CREDENTIALS).',
            details: error.message
        });
    }
});


// ----------------------------------------------------
// 啟動伺服器
// ----------------------------------------------------
app.listen(port, () => {
    console.log(`伺服器已啟動，正在監聽 http://localhost:${port}`);
});