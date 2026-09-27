# 🧠 TripDownMemoryLane — Multimodal AI & Quiz Backend Service

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](#technologies)
[![Express.js](https://img.shields.io/badge/Express.js-Framework-000000?logo=express&logoColor=white)](#technologies)
[![REST API](https://img.shields.io/badge/Architecture-RESTful%20API-blue.svg)](#system-architecture--external-services)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An asynchronous AI-driven backend microservice built with **Node.js** and **Express**. The service processes client-submitted image payloads (Base64), orchestrates computer vision analysis, performs generative language modeling for adaptive story and quiz generation, and synthesizes audio prompts via text-to-speech pipelines.


## 🔗 Project Ecosystem & Links

- **Frontend Application (Client):** [TripDownMemoryLane/memoryLaneFrontend](https://github.com/TripDownMemoryLane/memoryLaneFrontend) (React client interface built by team collaborators)
- **Course Submission Monorepo:** [TripDownMemoryLane/TripDownMemoryLane-final](https://github.com/TripDownMemoryLane/TripDownMemoryLane-final)
- **API Specification:** [`API.md`](./API.md) (Request/response schemas, payload structures, and status codes)
- **Engineering Log:** [`progress.md`](./progress.md) (Milestone and sprint tracking)


## 👨‍💻 Engineering Ownership & Scope

As the **sole backend engineer** for this system, my core technical contributions include:

- **AI Pipeline Integration (`aiService.js`):** Engineered asynchronous pipelines chaining Google Cloud Vision feature extraction directly into Hugging Face generative prompts for contextual quiz generation.
- **Audio Processing Engine (`audioService.js`):** Built server-side synthesis pipelines converting dynamic text to Base64-encoded audio streams via Google Cloud TTS.
- **Gateway & Middleware Design (`server.js`):** Implemented Express routing, payload parsing, CORS configurations for decoupled React integration, and structured HTTP error handling.
- **Contract Definition:** Documented standardized RESTful API contracts in `API.md` for seamless collaboration with the frontend engineering team.


## 🏗️ System Architecture & External Services

The service acts as an orchestration gateway aggregating three external cloud intelligence providers:

| Service / Platform | Role in Architecture | Implementation Details |
| :--- | :--- | :--- |
| **Google Cloud Vision API** | Visual Perception | Extracts semantic features, object labels, and contextual cues from uploaded images. |
| **Hugging Face Inference API** | Generative Reasoning | Generates narrative story arcs and multiple-choice quiz questions based on visual context. |
| **Google Cloud Text-to-Speech** | Auditory Feedback | Synthesizes quiz questions into Base64 audio streams for interactive voice accessibility. |

```text
[ React Frontend (Port 4000) ]
              │
      HTTP / Base64 Payload
              │
              ▼
[ Express Backend Gateway (Port 4001) ]
  ├── 1. Google Cloud Vision API    → Feature & Entity Extraction
  ├── 2. Hugging Face Inference API → Contextual Story & Question Generation
  └── 3. Google Cloud TTS           → Dynamic Audio Synthesis
              │
       JSON + Audio Payload
              │
              ▼
[ Client Application UI/Playback ]
```

## ⚙️ Network & Port Configuration

To support Cross-Origin Resource Sharing (CORS) between decoupled repositories during local integration:

* **Frontend Client (React):** `http://localhost:4000`
* **Backend Service (Express):** `http://localhost:4001`

---

## 📂 Repository Layout

```text
backend/
├── .env.example          # Environment template for local secrets
├── .gitignore
├── aiService.js          # Google Vision & Hugging Face pipeline logic
├── API.md                # Comprehensive endpoint specifications
├── audioService.js       # Google Cloud TTS synthesis service
├── package-lock.json
├── package.json
├── progress.md           # Engineering log and sprint tracking
└── server.js             # Application bootstrap, routing & server entry point
```


## 🚀 Getting Started

### Prerequisites

* **Node.js:** `v18.x` or higher
* **npm:** `v9.x` or higher
* Active API credentials for **Hugging Face** and **Google Cloud**

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/TripDownMemoryLane/backend.git
cd backend
```


2. **Install project dependencies:**
```bash
npm install
```


3. **Configure Environment Variables:**
Initialize your local environment file using the provided template:
```bash
cp .env.example .env
```


Add your service keys to `.env`:
```env
PORT=4001
HF_API_KEY=your_huggingface_access_token
GOOGLE_API_KEY=your_google_cloud_api_key
```


> **Credential References:**
> * **Hugging Face Token:** Obtain via [Hugging Face Settings → Tokens](https://huggingface.co/settings/tokens?utm_source=gemini) (Read access required).
> * **Google Cloud Key:** Generate an API key from the [Google Cloud Console](https://console.cloud.google.com/?utm_source=gemini) with **Cloud Vision API** and **Cloud Text-to-Speech API** enabled.
> 
> 


4. **Start the Development Server:**
```bash
npm start
```


The backend API will be live at `http://localhost:4001`.

## 📄 License

This project is distributed under the [MIT License](LICENSE).
