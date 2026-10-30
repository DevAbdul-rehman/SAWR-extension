import type { FC, FormEvent } from 'react';
import { Send, Bot, User, Loader2, Play, FileText, Highlighter, Lightbulb, GraduationCap } from 'lucide-react';
import type { ChatMessage } from '../types/chat';
import type { QuizQuestion, WeakTopicAnalysis } from '../types/quiz';
import { InteractiveQuiz } from './InteractiveQuiz';
import { MarkdownRenderer } from './MarkDownRenderer';
import { exportQuizToDocx } from '../services/exportDocx';

interface ChatInterfaceProps {
  hasScraped: boolean;
  isScraping: boolean;
  messages: ChatMessage[];
  isBotThinking: boolean;
  inputQuery: string;
  setInputQuery: (query: string) => void;
  pageHostname: string;
  dynamicSuggestions: string[];
  activeInteractiveQuiz: QuizQuestion[] | null;
  isGeneratingRecs: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  handleStartScraping: () => void;
  handleSendMessage: (e?: FormEvent, overrideText?: string) => void;
  handleExplainSelection: () => void;
  handleStartInteractiveQuiz: () => void;
  handleProgrammingHint: () => void;
  handleRequestRemediation: (weakTopics: WeakTopicAnalysis[]) => void;
  setActiveInteractiveQuiz: (quiz: QuizQuestion[] | null) => void;
  setDynamicSuggestions: (suggestions: string[]) => void;
}

export const ChatInterface: FC<ChatInterfaceProps> = ({
  hasScraped,
  isScraping,
  messages,
  isBotThinking,
  inputQuery,
  setInputQuery,
  pageHostname,
  dynamicSuggestions,
  activeInteractiveQuiz,
  isGeneratingRecs,
  messagesEndRef,
  handleStartScraping,
  handleSendMessage,
  handleExplainSelection,
  handleStartInteractiveQuiz,
  handleProgrammingHint,
  handleRequestRemediation,
  setActiveInteractiveQuiz,
  setDynamicSuggestions,
}) => {
  return (
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
            {isScraping ? <Loader2 className="spinner" size={13} /> : <Play size={13} />}
            <span>{isScraping ? 'Reading...' : 'Read This Page'}</span>
          </button>
        </div>
      )}

      <div className="widget-body">
        {messages.map((msg) => (
          <div key={msg.id} className={`widget-msg-row ${msg.role}`}>
            <div className="widget-avatar">
              {msg.role === 'assistant' ? <Bot size={15} /> : <User size={15} />}
            </div>
            <div className="widget-bubble">
              <MarkdownRenderer content={msg.content} />
              {msg.role === 'assistant' && msg.id !== 'welcome' && (
                <div className="bubble-actions">
                  <button
                    type="button"
                    className="export-quiz-btn"
                    onClick={() => exportQuizToDocx(msg.content, pageHostname)}
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
                  'Summarize the key points of this webpage in 4 concise bullets'
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
                  'List the technical stack, tools, or core concepts referenced on this page'
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
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              hasScraped ? 'Ask about this page...' : "Click 'Read This Page' first..."
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
  );
};

export default ChatInterface;