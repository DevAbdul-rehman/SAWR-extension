import { useState, useRef, useEffect, type FormEvent } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Play,
  FileText,
  Highlighter,
  Lightbulb,
  GraduationCap,
} from "lucide-react";
import type { ChatMessage } from "./types/chat";
import type { QuizQuestion, WeakTopicAnalysis } from "./types/quiz";
import { Header, type ExplanationMode } from "./components/Header";
import { NavigationTabs, type ActiveTab } from "./components/NavigationTabs";
import { Footer } from "./components/Footer";
import { InteractiveQuiz } from "./components/InteractiveQuiz";
import { MarkdownRenderer } from "./components/MarkDownRenderer";
import { AboutView } from "./views/AboutViews";
import { FaqView } from "./views/FaqViews";
import { SettingsView } from "./views/SettingsView";
import { callGeminiWithFallback } from "./services/gemini";
import { exportQuizToDocx } from "./services/exportDocx";
import "./App.css";

declare const chrome: any;

const MODE_PROMPTS: Record<ExplanationMode, string> = {
  Beginner:
    "TARGET AUDIENCE: Beginner. Explain concepts using simple language, real-world analogies, and minimal jargon. If code is shown, explain every single keyword step-by-step.",
  Intermediate:
    "TARGET AUDIENCE: Intermediate. Provide clear, direct explanations focusing on standard conventions, best practices, and practical implementation patterns.",
  Advanced:
    "TARGET AUDIENCE: Advanced / Senior. Focus on runtime performance, time/space complexity, memory management, underlying architecture, edge cases, and trade-offs.",
};

export const App = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [hasScraped, setHasScraped] = useState<boolean>(false);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [pageContext, setPageContext] = useState<string>("");
  const [inputQuery, setInputQuery] = useState<string>("");
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [isGeneratingRecs, setIsGeneratingRecs] = useState<boolean>(false);
  const [pageHostname, setPageHostname] = useState<string>("This Page");
  const [mode, setMode] = useState<ExplanationMode>("Intermediate");
  const [activeInteractiveQuiz, setActiveInteractiveQuiz] = useState<
    QuizQuestion[] | null
  >(null);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);

  const defaultWelcomeMessage: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content: `Hi! 👋 I am **SAWR** (Smart AI Website Reader). Click **"Read This Page"** whenever you want me to analyze what's on your screen!`,
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    defaultWelcomeMessage,
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
        if (tabs[0]?.url) {
          try {
            const host = new URL(tabs[0].url).hostname;
            setPageHostname(host);

            const storageKey = `sawr_session_${host}`;
            chrome.storage.local.get(
              [storageKey, "sawr_mode", "sawr_suggestions"],
              (result: any) => {
                if (result[storageKey]) {
                  const s = result[storageKey];
                  setPageContext(s.pageContext || "");
                  setHasScraped(Boolean(s.hasScraped));
                  if (s.messages && s.messages.length > 0)
                    setMessages(s.messages);
                }
                if (result.sawr_mode) setMode(result.sawr_mode);
                if (result.sawr_suggestions)
                  setDynamicSuggestions(result.sawr_suggestions);
              },
            );
          } catch {
            setPageHostname("Active Tab");
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    if (
      pageHostname !== "This Page" &&
      typeof chrome !== "undefined" &&
      chrome.storage
    ) {
      chrome.storage.local.set({
        [`sawr_session_${pageHostname}`]: { pageContext, hasScraped, messages },
        sawr_suggestions: dynamicSuggestions,
      });
    }
  }, [messages, pageContext, hasScraped, pageHostname, dynamicSuggestions]);

  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [
    messages,
    isBotThinking,
    activeInteractiveQuiz,
    dynamicSuggestions,
    activeTab,
  ]);

  const handleResetToIdle = () => {
    setMessages([defaultWelcomeMessage]);
    setHasScraped(false);
    setPageContext("");
    setInputQuery("");
    setIsBotThinking(false);
    setActiveInteractiveQuiz(null);
    setDynamicSuggestions([]);
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.remove([
        `sawr_session_${pageHostname}`,
        "sawr_suggestions",
      ]);
    }
  };

  const handleStartScraping = async () => {
    setIsScraping(true);
    if (typeof chrome !== "undefined" && chrome.tabs && chrome.scripting) {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab?.id) {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              const clone = document.body.cloneNode(true) as HTMLElement;
              clone
                .querySelectorAll(
                  "script, style, noscript, svg, nav, footer, iframe",
                )
                .forEach((el) => el.remove());
              return (clone.innerText || "").slice(0, 70000);
            },
          });
          setPageContext(results[0]?.result || "");
        }
      } catch (err) {
        console.error(err);
      }
    }
    setTimeout(() => {
      setHasScraped(true);
      setIsScraping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "system",
          content: `✅ Finished reading **${pageHostname}**! Ready for interactive testing or questions.`,
          timestamp: new Date(),
        },
      ]);
    }, 700);
  };

  const handleSendMessage = async (e?: FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    const userText = (overrideText || inputQuery).trim();
    if (!userText || isBotThinking) return;

    setDynamicSuggestions([]);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: userText,
        timestamp: new Date(),
      },
    ]);
    setInputQuery("");
    setIsBotThinking(true);

    try {
      const systemInstruction = `You are SAWR, an expert educational AI assistant analyzing the webpage "${pageHostname}".

${MODE_PROMPTS[mode]}

INSTRUCTIONS:
1. Understand the core concepts, structure, and details from the provided content.
2. If the user asks for generative tasks (like "make a quiz", "flashcards", "summarize", or "key takeaways"), generate them directly using the page facts.
3. If the user requests programming guidance or hints, act as a pedagogical mentor: provide algorithmic clues, pseudo-code steps, or point out edge cases instead of giving full completed code solutions immediately.
4. Match the technical depth defined in the TARGET AUDIENCE above.
5. Maintain continuity across follow-up questions from the conversation history.
6. CRITICAL FORMAT RULE: At the very end of your final reply, output exactly 3 concise, highly relevant follow-up questions (under 8 words each):
<<<SUGGESTIONS: Short Question 1? | Short Question 2? | Short Question 3?>>>

--- PAGE CONTENT ---
${pageContext || "No page content extracted yet."}
--------------------`;

      const rawTurns = messages
        .filter(
          (m) =>
            m.role === "user" || (m.role === "assistant" && m.id !== "welcome"),
        )
        .slice(-6);
      const conversationContents: any[] = [];
      let expectedRole: "user" | "model" = "user";

      for (const turn of rawTurns) {
        const turnRole = turn.role === "assistant" ? "model" : "user";
        if (turnRole === expectedRole) {
          conversationContents.push({
            role: turnRole,
            parts: [{ text: turn.content }],
          });
          expectedRole = expectedRole === "user" ? "model" : "user";
        }
      }
      conversationContents.push({ role: "user", parts: [{ text: userText }] });

      const rawBotReply = await callGeminiWithFallback(
        conversationContents,
        systemInstruction,
      );
      let cleanReplyText = rawBotReply;
      let parsedSuggestions: string[] = [];

      const suggestionMatch = rawBotReply.match(
        /<<<SUGGESTIONS:\s*(.*?)\s*>>>/s,
      );
      if (suggestionMatch && suggestionMatch[1]) {
        parsedSuggestions = suggestionMatch[1]
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean);
        cleanReplyText = rawBotReply.replace(suggestionMatch[0], "").trim();
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: cleanReplyText,
          timestamp: new Date(),
        },
      ]);
      setDynamicSuggestions(parsedSuggestions);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ ${error?.message || "Failed to generate answer"}. Please try again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const handleStartInteractiveQuiz = async () => {
    if (!hasScraped || isBotThinking) return;
    setDynamicSuggestions([]);
    setIsBotThinking(true);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: "Start an Interactive Knowledge Test on this page.",
        timestamp: new Date(),
      },
    ]);

    try {
      const systemInstruction = `You are SAWR, an educational assessment engine.

${MODE_PROMPTS[mode]}

TASK:
Generate exactly 4 multiple-choice assessment questions testing student comprehension of this webpage. Ensure each question tests a distinct subtopic and assigns an accurate "topic" label.

CRITICAL FORMAT REQUIREMENT:
You MUST return ONLY a raw JSON array of objects. Do not write markdown blocks (\`\`\`json), greetings, or explanations outside the JSON.

SCHEMA:
[
  {
    "id": 1,
    "topic": "Specific Topic Name",
    "question": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Clear explanation of why this is correct."
  }
]

--- PAGE CONTENT ---
${pageContext || "General CS fundamentals."}
--------------------`;

      const contents = [
        {
          role: "user",
          parts: [{ text: "Generate the JSON interactive quiz now." }],
        },
      ];
      const rawJson = await callGeminiWithFallback(contents, systemInstruction);
      const cleanedJson = rawJson
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      const parsedQuestions: QuizQuestion[] = JSON.parse(cleanedJson);

      setActiveInteractiveQuiz(parsedQuestions);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "🎯 **Interactive Test Started!** Answer each question below to check your mastery.",
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ Failed to build interactive quiz: ${err?.message || "Invalid format"}. Please try clicking Test again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const handleRequestRemediation = async (weakTopics: WeakTopicAnalysis[]) => {
    setIsGeneratingRecs(true);
    setActiveInteractiveQuiz(null);

    const weakSummary = weakTopics
      .map(
        (wt) =>
          `- Topic: ${wt.topic} (Missed questions: ${wt.missedQuestions.join("; ")})`,
      )
      .join("\n");

    const prompt = `Based on my quiz performance on "${pageHostname}", I struggled with these specific concepts:

${weakSummary}

Please provide a personalized Learning Remediation Plan:
1. **Core Concept Clarification:** Explain why these topics are tricky and break down the foundational intuition using simple terms.
2. **Review Checklist:** 2-3 specific subtopics or syntax rules to re-read on this webpage.
3. **Practice Challenge:** 1 small exercise or coding scenario to reinforce these exact weak points.`;

    await handleSendMessage(undefined, prompt);
    setIsGeneratingRecs(false);
  };

  const handleExplainSelection = async () => {
    if (isBotThinking) return;

    if (typeof chrome === "undefined" || !chrome.tabs || !chrome.scripting) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "system",
          content:
            "⚠️ Chrome scripting API is unavailable in this environment.",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) return;

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection()?.toString() || "",
      });

      const selectedText = (results[0]?.result || "").trim();

      if (!selectedText) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "system",
            content:
              "⚠️ **No text highlighted.** Please select/highlight text on the webpage first, then click **Explain Selected**.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      setDynamicSuggestions([]);
      const userPrompt = `Explain this highlighted section:\n\n> ${selectedText}`;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: userPrompt,
          timestamp: new Date(),
        },
      ]);
      setIsBotThinking(true);

      const systemInstruction = `You are SAWR, an expert educational AI assistant.

${MODE_PROMPTS[mode]}

The user highlighted this snippet from the page "${pageHostname}":

--- HIGHLIGHTED TEXT ---
${selectedText}
------------------------

ADDITIONAL SURROUNDING CONTEXT:
${pageContext ? pageContext.slice(0, 5000) : "None"}

INSTRUCTIONS:
1. Explain the snippet clearly matching the target audience depth.
2. If it is code or syntax, break down what each line or keyword does.
3. If it contains technical jargon, provide clear real-world analogies.
4. Keep the explanation direct, well-structured, and easy to follow.
5. End your reply with 3 suggested follow-up questions:
<<<SUGGESTIONS: Short Question 1? | Short Question 2? | Short Question 3?>>>`;

      const contents = [
        {
          role: "user",
          parts: [
            {
              text: `Explain this highlighted text from "${pageHostname}":\n\n"${selectedText}"`,
            },
          ],
        },
      ];
      const rawReply = await callGeminiWithFallback(
        contents,
        systemInstruction,
      );

      let cleanReply = rawReply;
      let parsedSuggestions: string[] = [];

      const suggestionMatch = rawReply.match(/<<<SUGGESTIONS:\s*(.*?)\s*>>>/s);
      if (suggestionMatch && suggestionMatch[1]) {
        parsedSuggestions = suggestionMatch[1]
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean);
        cleanReply = rawReply.replace(suggestionMatch[0], "").trim();
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: cleanReply,
          timestamp: new Date(),
        },
      ]);
      setDynamicSuggestions(parsedSuggestions);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ ${err?.message || "Failed to generate explanation"}. Please try again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const handleProgrammingHint = () => {
    if (!hasScraped || isBotThinking) return;
    const prompt =
      "Analyze the primary technical problem or code concept on this page and provide a pedagogical hint (pseudo-code structure and key logic considerations) without giving away the full code solution.";
    setInputQuery(prompt);
    handleSendMessage(undefined, prompt);
  };

  return (
    <div className="popup-container">
      <Header
        pageHostname={pageHostname}
        hasScraped={hasScraped}
        mode={mode}
        onModeChange={(m: ExplanationMode) => {
          setMode(m);
          chrome?.storage?.local?.set({ sawr_mode: m });
        }}
        onReset={handleResetToIdle}
      />

      <NavigationTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      {activeTab === "chat" && (
        <>
          {!hasScraped && (
            <div className="dormant-banner">
              <p>Bot is idle. Click to read page:</p>
              <button
                type="button"
                className="start-scrape-btn"
                onClick={handleStartScraping}
                disabled={isScraping}
              >
                {isScraping ? (
                  <Loader2 className="spinner" size={13} />
                ) : (
                  <Play size={13} />
                )}
                <span>{isScraping ? "Reading..." : "Read This Page"}</span>
              </button>
            </div>
          )}

          <div className="widget-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`widget-msg-row ${msg.role}`}>
                <div className="widget-avatar">
                  {msg.role === "assistant" ? (
                    <Bot size={15} />
                  ) : (
                    <User size={15} />
                  )}
                </div>
                <div className="widget-bubble">
                  <MarkdownRenderer content={msg.content} />
                  {msg.role === "assistant" && msg.id !== "welcome" && (
                    <div className="bubble-actions">
                      <button
                        type="button"
                        className="export-quiz-btn"
                        onClick={() =>
                          exportQuizToDocx(msg.content, pageHostname)
                        }
                      >
                        <FileText size={13} />
                        <span>Export to .docx</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {activeInteractiveQuiz && (
              <InteractiveQuiz
                questions={activeInteractiveQuiz}
                domain={pageHostname}
                onExit={() => setActiveInteractiveQuiz(null)}
                onRequestRemediation={handleRequestRemediation}
                isGeneratingRecs={isGeneratingRecs}
              />
            )}

            {isBotThinking && (
              <div className="widget-msg-row assistant">
                <div className="widget-avatar">
                  <Bot size={15} />
                </div>
                <div className="widget-bubble thinking">
                  <Loader2 className="spinner" size={14} />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {dynamicSuggestions.length > 0 && !isBotThinking && hasScraped && (
            <div className="dynamic-suggestions-container">
              <span className="suggestions-label">💡 Follow-up:</span>
              <div className="suggestions-chips">
                {dynamicSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="suggestion-chip"
                    title={suggestion}
                    onClick={() => {
                      setDynamicSuggestions([]);
                      handleSendMessage(undefined, suggestion);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="widget-footer">
            {hasScraped && (
              <div className="quick-chips">
                <button
                  type="button"
                  className="chip-highlight"
                  onClick={handleExplainSelection}
                  disabled={isBotThinking}
                >
                  <Highlighter size={12} />
                  <span>Explain Selected</span>
                </button>
                <button
                  type="button"
                  className="chip-hint"
                  onClick={handleStartInteractiveQuiz}
                  disabled={isBotThinking}
                >
                  <GraduationCap size={13} />
                  <span>Test Knowledge</span>
                </button>
                <button
                  type="button"
                  onClick={handleProgrammingHint}
                  disabled={isBotThinking}
                >
                  <Lightbulb size={12} />
                  <span>Hint</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      undefined,
                      "Summarize the key points of this webpage in 4 concise bullets",
                    )
                  }
                  disabled={isBotThinking}
                >
                  📌 Summary
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      undefined,
                      "List the technical stack, tools, or core concepts referenced on this page",
                    )
                  }
                  disabled={isBotThinking}
                >
                  🛠️ Tech Stack
                </button>
              </div>
            )}

            <form className="widget-form" onSubmit={handleSendMessage}>
              <textarea
                rows={1}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  hasScraped
                    ? "Ask about this page..."
                    : "Click 'Read This Page' first..."
                }
                disabled={!hasScraped}
              />
              <button
                type="submit"
                disabled={!hasScraped || !inputQuery.trim() || isBotThinking}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </>
      )}

      {activeTab === "about" && <AboutView />}
      {activeTab === "faq" && <FaqView />}
      {activeTab === "settings" && (
        <SettingsView
          pageHostname={pageHostname}
          hasScraped={hasScraped}
          onReset={handleResetToIdle}
        />
      )}

      <Footer charCount={pageContext.length} />
    </div>
  );
};

export default App;
