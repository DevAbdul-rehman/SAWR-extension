# SAWR (Smart AI Website Reader) - Browser Extension AI Assistant

**SAWR (Smart AI Website Reader)** is an intelligent, client-side Chrome and Brave browser extension built for computer science students, educators, and technical professionals.
Designed as part of the **Advanced Web Development (AWD)** coursework, SAWR extracts active webpage DOM context, explains complex code snippets or error tracebacks, facilitates interactive multiple-choice testing with remediation pathways, and exports formatted study notes to Microsoft Word (`.docx`).

## 🌟 Key Features

* **DOM-Context Aware Scraping:** Reads and sanitizes active tab text content up to 70,000 characters using Chrome Extension Scripting APIs, automatically purging ads, scripts, navbars, and SVGs.

* **Structured Multi-View Interface:** Modular navigation tabs providing isolated screens for **Chat**, **About SAWR**, **FAQ / User Guide**, and **Settings / Domain Cache Controls**.

* **Interactive Knowledge Assessment:** Generates dynamic multiple-choice assessments (MCQs) mapped to subtopic tags, featuring real-time option validation and instant score tracking.

* **Weak Topic Identification & Remediation:** Analyzes missed questions upon quiz completion and queries Gemini for a targeted remediation roadmap (clarifications, revision checklists, and mini coding challenges).

* **Pedagogical Hint Mode:** Delivers algorithmic clues, conceptual structures, and pseudo-code edge cases without spoiling full solutions.

* **3-Way Depth Toggle:** Switch dynamically between **Beginner** (analogies, no heavy jargon), **Intermediate** (idiomatic practices), and **Advanced** (runtime complexity, memory trade-offs, architecture).

* **Domain-Based Client Persistence:** Leverages `chrome.storage.local` indexed by tab hostnames (`sawr_session_<hostname>`) to restore conversations, context, and settings across browsing sessions.

* **Resilient Multi-Key / Multi-Model Cascade:** Automatically catches HTTP 429 (`RESOURCE_EXHAUSTED`) quota limits, rotating API keys and falling back between `gemini-2.0-flash` and `gemini-3.5-flash-lite`.

* **Microsoft Word (`.docx`) Export:** Uses `docx` to package quizzes, answers, and study guides into structured OpenXML Word documents.

## 🛠️ Tech Stack & Architecture

* **Frontend Core:** React 18, TypeScript

* **Build System:** Vite

* **AI Integration:** Google Gen AI SDK (`@google/genai`)

* **Icons & Styling:** `lucide-react`, Custom Scoped CSS (Modern Dark Mode UI)

* **Markdown Rendering:** Custom markdown parser with syntax formatting

* **Document Engine:** `docx` (OpenXML)

* **Extension Platform:** Chrome Extension Manifest V3 (`chrome.storage`, `chrome.scripting`, `chrome.tabs`)

## 📂 Project Directory Structure

```text
chatbot/
├── public/
│   ├── manifest.json            # Manifest V3 extension configuration
│   ├── sawr-logo.png            # Application brand assets & header icon
│   └── sawr-logo.jpeg           # Alternate brand asset
├── src/
│   ├── components/              # Modular UI components
│   │   ├── Header.tsx           # Branding, difficulty pills, and session reset
│   │   ├── NavigationTabs.tsx   # Structured navigation tab bar
│   │   ├── Footer.tsx           # Global sub-footer with metadata and links
│   │   ├── InteractiveQuiz.tsx  # Dynamic MCQ engine and diagnostic scoring
│   │   └── MarkDownRenderer.tsx # Formatted bot responses & code blocks
│   ├── views/                   # Structured page views
│   │   ├── AboutViews.tsx       # System overview and tech stack
│   │   ├── FaqViews.tsx         # Operational guide and troubleshooting
│   │   └── SettingsView.tsx     # Active domain cache and engine settings
│   ├── services/                # Business logic and external APIs
│   │   ├── gemini.ts            # Resilient API key & multi-model fallback engine
│   │   └── exportDocx.ts        # Word document (.docx) generation pipeline
│   ├── types/                   # TypeScript interfaces and type definitions
│   │   ├── chat.ts              # Message payloads and chat memory types
│   │   └── quiz.ts              # Assessment question and diagnostic types
│   ├── App.css                  # Unified design system styles
│   ├── App.tsx                  # Top-level view coordinator & state manager
│   ├── index.css                # Global base resets
│   └── main.tsx                 # React root render entry point
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite bundler configuration
```