// audioService.js
// 專門處理 Google Cloud Text-to-Speech (TTS) 服務
// *** 使用 axios 直接呼叫 REST API + GOOGLE_API_KEY ***

require('dotenv').config();
const axios = require('axios');

// 檢查 API Key
if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not set in environment variables, which is required for TTS REST API.");
}

const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

async function convertTextToAudioBase64(text) {
    if (!text || typeof text !== 'string') {
        throw new Error("TTS input must be a non-empty string.");
    }
    
    // 設置 TTS 請求 Body
    const requestBody = {
        input: { text: text },
        voice: { 
            languageCode: 'zh-TW', // 或 cmn-TW，但 zh-TW 通常兼容性更高
            name: 'cmn-TW-Standard-A', // 官網名稱
        },
        // 選擇音頻格式為 MP3
        audioConfig: { audioEncoding: 'MP3' }, 
    };

    console.log(`🎤 正在使用 REST API 轉換語音... 文字長度: ${text.length}`);

    try {
        // 直接呼叫 REST API，並在 URL 中傳入 API Key
        const response = await axios.post(
            `${TTS_ENDPOINT}?key=${process.env.GOOGLE_API_KEY}`, 
            requestBody,
            { timeout: 30000 }
        );
        
        // Google TTS API 的回應會將音頻內容以 Base64 字串形式放在 audioContent 欄位
        const audioBase64 = response.data.audioContent;
        
        if (!audioBase64) {
            throw new Error("TTS API response missing audioContent.");
        }
        
        // 加上 Data URI 前綴，方便前端直接使用 <audio> 標籤播放
        return `data:audio/mp3;base64,${audioBase64}`;
        
    } catch (error) {
        // 處理 Axios 錯誤
        const details = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error('❌ Google TTS REST 呼叫失敗:', details);
        
        // 這裡的失敗原因很可能是 API Key 沒有啟用 TTS 服務或權限不足
        throw new Error(`TTS generation failed. Details: ${details}`);
    }
}

async function addAudioToQuiz(quizArray) {
    if (!Array.isArray(quizArray) || quizArray.length === 0) {
        return [];
    }

    const audioPromises = quizArray.map(async (quizItem, index) => {
        try {
            const optionsText = quizItem.options
                .map((option, idx) => {
                    const marker = String.fromCharCode(65 + idx); 
                    return `${marker}。${option}`; 
                })
                .join('。'); 

            

            const numberToChinese = (n) => {
                const map = ['零', '一', '二', '三', '四', '五'];
                return map[n] || String(n); 
            };
            const questionNumber = numberToChinese(index + 1);
            // 組合完整的朗讀內容
            const fullTextToSpeak = `第 ${questionNumber} 題。${quizItem.question}。${optionsText}`;
            
            console.log(`🎤 正在組合並生成語音 (題目 ${index + 1}): ${fullTextToSpeak}`);

            // ----------------------------------------------------
            // 💡 2. 呼叫 TTS 轉換長字串
            // ----------------------------------------------------
            const audioBase64 = await convertTextToAudioBase64(fullTextToSpeak);
            
            return {
                ...quizItem,
                // 儲存完整的音訊內容
                fullAudioBase64: audioBase64, 
                // 📝 建議將欄位名稱改為 fullAudioBase64，以區分原本只念題目的需求
            };
        } catch (error) {
            console.error(`❌ 題目 ${index + 1} 完整語音生成失敗: ${error.message}`);
            return {
                ...quizItem,
                fullAudioBase64: null, // 失敗時返回 null
            };
        }
    });

    return Promise.all(audioPromises);
}

module.exports = { 
    convertTextToAudioBase64,
    addAudioToQuiz 
};