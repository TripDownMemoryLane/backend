# 🧠 TripDownMemoryLane — Multimodal AI & Quiz Backend Service

[![CI Pipeline](https://github.com/TripDownMemoryLane/backend/actions/workflows/ci.yml/badge.svg)](https://github.com/TripDownMemoryLane/backend/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](#technologies)
[![Express.js](https://img.shields.io/badge/Express.js-v5.x-000000?logo=express&logoColor=white)](#technologies)
[![Jest Testing](https://img.shields.io/badge/Tested%20with-Jest%20%26%20Supertest-C21325?logo=jest&logoColor=white)](#testing--quality-assurance)
[![REST API](https://img.shields.io/badge/Architecture-RESTful%20API-blue.svg)](#system-architecture--external-services)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An asynchronous AI-driven backend microservice built with **Node.js** and **Express 5**. The service ingests client-submitted image payloads (Base64), orchestrates computer vision analysis, performs generative language modeling for adaptive story and quiz generation, and synthesizes audio prompts via text-to-speech pipelines.

---

## 🔗 Project Ecosystem & Links

- **Frontend Application (Client):** [TripDownMemoryLane/memoryLaneFrontend](https://github.com/TripDownMemoryLane/memoryLaneFrontend) (React client interface built by team collaborators)
- **Course Submission Monorepo:** [TripDownMemoryLane/TripDownMemoryLane](https://github.com/TripDownMemoryLane/TripDownMemoryLane)
- **API Specification:** [`API.md`](./API.md) (Request/response schemas, payload structures, and status codes)

---

## 👨‍💻 Engineering Ownership & Scope

As the **sole backend engineer** for this microservice, my core technical contributions include:

- **AI Pipeline Integration (`aiService.js`):** Engineered asynchronous pipelines chaining Google Cloud Vision feature extraction directly into Hugging Face generative prompts for contextual quiz generation.
- **Audio Processing Engine (`audioService.js`):** Built server-side synthesis pipelines converting dynamic text to Base64-encoded audio streams via Google Cloud TTS.
- **Gateway & Middleware Design (`server.js`):** Configured Express 5 routing, high-capacity Base64 payload limits (50MB), CORS policies for decoupled React integration, and structured HTTP error handling.
- **Verification & CI/CD (`tests/`, `.github/`):** Authored integration tests using Jest and Supertest with mock service boundaries to achieve deterministic, zero-cost CI execution via GitHub Actions.
- **Contract Definition:** Documented standardized RESTful API contracts in `API.md` for seamless collaboration with the frontend engineering team.

---

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

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```


Configure your access keys:
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


## 🧪 Testing & Quality Assurance

This repository includes automated integration tests using **Jest** and **Supertest**. External cloud APIs are mocked during test execution to ensure fast, isolated, and deterministic test runs without incurring cloud billing.

* **Run all integration tests:**
```bash
npm test
```

* **Run static syntax checks:**
```bash
npm run lint
```

All commits pushed to `main` are automatically verified across Node.js 18.x and 20.x runtimes via the GitHub Actions CI pipeline.


## 📄 License

This project is distributed under the [MIT License](LICENSE).
