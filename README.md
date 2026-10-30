# SARF (Smart AI Read & Find) - Browser Extension AI Assistant

[![Built With React](https://img.shields.io/badge/Built_With-React_18-61DAFB?logo=react&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](#)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white)](#)
[![Google GenAI](https://img.shields.io/badge/AI_Engine-Gemini_2.0_Flash-4285F4?logo=google&logoColor=white)](#)
[![Coursework](https://img.shields.io/badge/Coursework-Advanced_Web_Development-orange)](#)

**SARF (Smart AI Read & Find)** is an intelligent, client-side Chrome browser extension built for computer science students, educators, and technical professionals.
Designed as part of the **Advanced Web Development (AWD)** coursework, SARF extracts active webpage DOM context, explains complex code snippets or error tracebacks, facilitates interactive multiple-choice testing with remediation pathways, and exports formatted study notes to Microsoft Word (`.docx`).

## 🌟 Key Features

- **DOM-Context Aware Scraping:** Reads and sanitizes active tab text content up to 70,000 characters using Chrome Extension Scripting APIs, automatically purging ads, scripts, navbars, and SVGs.
- **Structured Multi-View Interface:** Modular navigation tabs providing isolated screens for **Chat**, **About SARF**, **FAQ / User Guide**, and **Settings / Domain Cache Controls**.
- **Interactive Knowledge Assessment:** Generates dynamic multiple-choice assessments (MCQs) mapped to subtopic tags, featuring real-time option validation and instant score tracking.
- **Weak Topic Identification & Remediation:** Analyzes missed questions upon quiz completion and queries Gemini for a targeted remediation roadmap (clarifications, revision checklists, and mini coding challenges).
- **Pedagogical Hint Mode:** Delivers algorithmic clues, conceptual structures, and pseudo-code edge cases without spoiling full solutions.
- **Explain Selected Snippet:** Highlight any code syntax or technical error on any website (e.g., LeetCode, GitHub, MDN) and click **Explain Selected** for an immediate breakdown.
- **3-Way Depth Toggle:** Switch dynamically between **Beginner** (analogies, no heavy jargon), **Intermediate** (idiomatic practices), and **Advanced** (runtime complexity, memory trade-offs, architecture).
- **Dynamic Horizontal Follow-up Chips:** Generates concise, 1-line suggested follow-up prompts after each AI response that horizontally scroll to preserve reading viewport space.
- **Domain-Based Client Persistence:** Leverages `chrome.storage.local` indexed by tab hostnames (`sarf_session_<hostname>`) to restore conversations, context, and settings across browsing sessions.
- **Resilient Multi-Key / Multi-Model Cascade:** Automatically catches HTTP 429 (`RESOURCE_EXHAUSTED`) quota limits, rotating API keys and falling back between `gemini-2.0-flash` and `gemini-3.5-flash-lite`.
- **Microsoft Word (`.docx`) Export:** Uses `docx` to package quizzes, answers, and study guides into structured OpenXML Word documents.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core:** React 18, TypeScript
- **Build System:** Vite
- **AI Integration:** Google Gen AI SDK (`@google/genai`)
- **Icons & Styling:** `lucide-react`, Custom Scoped CSS (Modern Dark Mode UI)
- **Markdown & Code Highlighting:** `react-markdown`, `prismjs`
- **Document Engine:** `docx`
- **Extension Platform:** Chrome Extension Manifest V3 (`chrome.storage`, `chrome.scripting`, `chrome.tabs`)

---

## 📂 Project Directory Structure

chatbot/
├── public/
│   ├── manifest.json            # Manifest V3 extension configuration
│   ├── sarf-logo.png            # Application brand assets
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/              # Modular UI components
│   │   ├── Header.tsx           # Branding, difficulty pills, and session reset
│   │   ├── NavigationTabs.tsx   # Structured navigation tab bar
│   │   ├── Footer.tsx           # Global sub-footer with metadata and doc links
│   │   ├── InteractiveQuiz.tsx  # Dynamic MCQ engine and diagnostic scoring
│   │   └── MarkDownRenderer.tsx # Prism syntax highlighting and markdown display
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
│   ├── index.css
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts