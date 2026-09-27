# 📡 Quiz API Specification

RESTful API specification for the `quiz-api` microservice. This service processes visual payloads, orchestrates generative AI storytelling, and produces text-to-speech audio streams.

- **Base URL:** `http://localhost:4001`
- **Default Protocol:** HTTP/1.1
- **Content-Type:** `application/json`


## Endpoint Summary

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Health check & service readiness probe | `200` |
| `POST` | `/generate-story` | Extracts image features and synthesizes narrative stories | `200`, `400`, `502` |
| `POST` | `/generate-quiz` | Generates quiz items and Base64-encoded audio prompts | `200`, `400`, `502` |

---

## 1. Health Check

Verifies server availability and service uptime.

- **Method:** `GET`
- **Path:** `/`
- **Headers:** None

#### Response (`200 OK`)
```json
{
    "message": "接上接上咯 XD XD XD ！🎉🎉🎊🎊",
    "endpoint": "this is GET / router"
}
```

## 2. Story Generation (`/generate-story`)

Consumes Base64-encoded image strings and invokes Google Cloud Vision and Hugging Face pipelines to return contextual narratives.

* **Method:** `POST`
* **Path:** `/generate-story`
* **Headers:** `Content-Type: application/json`

#### Request Payload

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `images` | `string[]` | Yes | Array of Base64 Data URL formatted image strings (`data:image/jpeg;base64,...`) |

```json
{
  "images": [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",  // Picture 1
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",  // Picture 2
    "data:image/jpeg;base64,/9j/8hHdJBjhingABAQ..."  // Picture 3
  ]
}
```

#### Success Response (`200 OK`)
```json
{
    "success": true,
    "message": "Successfully generated stories!",
    "stories": [
        "...", // This is the story generated from Picture 1
        "...", // This is the story generated form Picture 2
        "..." // This is the story generated from Picture 3
    ]
}
```

#### Error Response (`400 Bad Request`)

```json
{
  "success": false,
  "error": "Invalid payload: 'images' must be a non-empty array of valid Base64 strings."
}
```

## 3. Quiz & Audio Synthesis (`/generate-quiz`)

Transforms narrative texts into multiple-choice recall assessments and synthesizes spoken audio prompts via Google Cloud Text-to-Speech.

* **Method:** `POST`
* **Path:** `/generate-quiz`
* **Headers:** `Content-Type: application/json`

#### Request Payload

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `stories` | `string[]` | Yes | Array of narrative strings to evaluate |

```json
{
  "stories": [
    "...", // Story of picture 1
    "...", // Story of Picture 2
    "..."  // Story of Picture 3
  ]
}

```

#### Success Response (`200 OK`)
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

#### Error Response (`502 Bad Gateway`)

```json
{
  "success": false,
  "error": "Upstream service timeout: Failed to receive timely response from Hugging Face Inference API."
}

```

## Client Integration Example (JavaScript / Browser)

Below is an end-to-end client workflow: converting uploaded files to Base64, requesting story generation, and producing quiz payloads.


```javascript
// Utility: Convert a File object to a Base64 Data URL string
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Complete pipeline call
const handleImageUploadAndQuizGeneration = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  try {
    // 1. Convert all selected image files to Base64
    const base64Images = await Promise.all(
      Array.from(files).map((file) => convertFileToBase64(file))
    );

    // 2. Generate stories from uploaded images
    const storyResponse = await fetch("http://localhost:4001/generate-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: base64Images })
    });
    const storyData = await storyResponse.json();

    if (!storyData.success) {
      throw new Error(storyData.error || "Failed to generate stories.");
    }

    // 3. Generate quiz questions and synthesized TTS audio from stories
    const quizResponse = await fetch("http://localhost:4001/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stories: storyData.stories })
    });
    const quizData = await quizResponse.json();

    return quizData.questions;
  } catch (error) {
    console.error("Pipeline execution failed:", error);
    throw error;
  }
};
```
