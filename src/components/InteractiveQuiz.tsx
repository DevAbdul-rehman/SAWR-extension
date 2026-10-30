import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, FileText, Award, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import type { QuizQuestion, ActiveQuizSession, WeakTopicAnalysis } from '../types/quiz';
import { exportQuizToDocx } from '../services/exportDocx';

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  domain: string;
  onExit: () => void;
  onRequestRemediation: (weakTopics: WeakTopicAnalysis[]) => void;
  isGeneratingRecs?: boolean;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  questions,
  domain,
  onExit,
  onRequestRemediation,
  isGeneratingRecs = false,
}) => {
  const [session, setSession] = useState<ActiveQuizSession>({
    questions,
    currentIndex: 0,
    selectedAnswers: {},
    score: 0,
    isCompleted: false,
  });

  const currentQ = session.questions[session.currentIndex];
  const hasAnsweredCurrent = session.selectedAnswers[currentQ?.id] !== undefined;
  const currentAnswer = session.selectedAnswers[currentQ?.id];

  const handleSelectOption = (optionIndex: number) => {
    if (hasAnsweredCurrent) return;

    const isCorrect = optionIndex === currentQ.correctIndex;
    const nextScore = isCorrect ? session.score + 1 : session.score;

    setSession((prev) => ({
      ...prev,
      score: nextScore,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [currentQ.id]: optionIndex,
      },
    }));
  };

  const handleNextQuestion = () => {
    if (session.currentIndex < session.questions.length - 1) {
      setSession((prev) => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
      }));
    } else {
      setSession((prev) => ({
        ...prev,
        isCompleted: true,
      }));
    }
  };

  const handleRestart = () => {
    setSession({
      questions,
      currentIndex: 0,
      selectedAnswers: {},
      score: 0,
      isCompleted: false,
    });
  };

  // Identify topics where questions were missed
  const getWeakTopics = (): WeakTopicAnalysis[] => {
    const topicMap: Record<string, string[]> = {};

    session.questions.forEach((q) => {
      const userChoice = session.selectedAnswers[q.id];
      if (userChoice !== q.correctIndex) {
        const topicName = q.topic || 'General Concepts';
        if (!topicMap[topicName]) topicMap[topicName] = [];
        topicMap[topicName].push(q.question);
      }
    });

    return Object.entries(topicMap).map(([topic, missedQuestions]) => ({
      topic,
      missedQuestions,
    }));
  };

  const handleExportDocx = () => {
    let reportMarkdown = `# Knowledge Test Results: ${domain}\n\n`;
    reportMarkdown += `**Final Score:** ${session.score} / ${session.questions.length}\n\n---\n\n`;

    session.questions.forEach((q, idx) => {
      const userSelected = session.selectedAnswers[q.id];
      const isCorrect = userSelected === q.correctIndex;
      reportMarkdown += `### Question ${idx + 1} [${q.topic}]: ${q.question}\n`;
      q.options.forEach((opt, oIdx) => {
        const marker = oIdx === q.correctIndex ? ' (Correct Answer)' : '';
        const userMarker = oIdx === userSelected ? ' [Your Choice]' : '';
        reportMarkdown += `- ${String.fromCharCode(65 + oIdx)}. ${opt}${marker}${userMarker}\n`;
      });
      reportMarkdown += `\n**Status:** ${isCorrect ? '✅ Correct' : '❌ Incorrect'}\n`;
      reportMarkdown += `**Explanation:** ${q.explanation}\n\n`;
    });

    const weakTopics = getWeakTopics();
    if (weakTopics.length > 0) {
      reportMarkdown += `## Identified Weak Areas\n`;
      weakTopics.forEach((wt) => {
        reportMarkdown += `- **${wt.topic}**: ${wt.missedQuestions.length} missed question(s)\n`;
      });
    }

    exportQuizToDocx(reportMarkdown, domain);
  };

  if (session.isCompleted) {
    const percentage = Math.round((session.score / session.questions.length) * 100);
    const weakTopics = getWeakTopics();

    return (
      <div className="quiz-container completed">
        <div className="quiz-result-header">
          <Award size={32} className="award-icon" />
          <h4>Knowledge Check Complete!</h4>
          <p className="score-tally">
            You scored <strong>{session.score}</strong> / {session.questions.length} ({percentage}%)
          </p>
        </div>

        {/* Weak Topic Diagnostics */}
        {weakTopics.length > 0 ? (
          <div className="weak-topics-card">
            <div className="weak-topics-header">
              <AlertTriangle size={14} className="weak-icon" />
              <span>Areas for Improvement</span>
            </div>
            <ul className="weak-topics-list">
              {weakTopics.map((item, idx) => (
                <li key={idx}>
                  <strong>{item.topic}</strong> ({item.missedQuestions.length} missed)
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="quiz-recs-btn"
              onClick={() => onRequestRemediation(weakTopics)}
              disabled={isGeneratingRecs}
            >
              {isGeneratingRecs ? (
                <>
                  <Loader2 size={13} className="spinner" />
                  <span>Building Study Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Get Targeted Study Plan</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="perfect-score-banner">
            🎉 <strong>Mastery Achieved!</strong> You got every question right on this page.
          </div>
        )}

        <div className="quiz-completed-actions">
          <button type="button" className="quiz-btn restart" onClick={handleRestart}>
            <RotateCcw size={14} />
            <span>Retake Quiz</span>
          </button>
          <button type="button" className="quiz-btn export" onClick={handleExportDocx}>
            <FileText size={14} />
            <span>Export to .docx</span>
          </button>
        </div>

        <button type="button" className="quiz-exit-link" onClick={onExit}>
          Back to Chat
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${((session.currentIndex + 1) / session.questions.length) * 100}%` }}
        />
      </div>

      <div className="quiz-meta">
        <span className="quiz-step">
          Q{session.currentIndex + 1} of {session.questions.length} • <em>{currentQ.topic}</em>
        </span>
        <span className="quiz-score-badge">Score: {session.score}</span>
      </div>

      <h4 className="quiz-question-text">{currentQ.question}</h4>

      <div className="quiz-options">
        {currentQ.options.map((opt, idx) => {
          let btnClass = 'quiz-option-btn';
          if (hasAnsweredCurrent) {
            if (idx === currentQ.correctIndex) {
              btnClass += ' correct';
            } else if (idx === currentAnswer) {
              btnClass += ' incorrect';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              className={btnClass}
              onClick={() => handleSelectOption(idx)}
              disabled={hasAnsweredCurrent}
            >
              <span className="opt-letter">{String.fromCharCode(65 + idx)}</span>
              <span className="opt-text">{opt}</span>
              {hasAnsweredCurrent && idx === currentQ.correctIndex && <CheckCircle2 size={16} className="state-icon correct" />}
              {hasAnsweredCurrent && idx === currentAnswer && idx !== currentQ.correctIndex && (
                <XCircle size={16} className="state-icon incorrect" />
              )}
            </button>
          );
        })}
      </div>

      {hasAnsweredCurrent && (
        <div className="quiz-explanation-box">
          <p className="explanation-title">
            {currentAnswer === currentQ.correctIndex ? '🎉 Correct!' : '💡 Explanation:'}
          </p>
          <p className="explanation-body">{currentQ.explanation}</p>
        </div>
      )}

      <div className="quiz-footer-actions">
        <button type="button" className="quiz-exit-btn" onClick={onExit}>
          Exit
        </button>
        {hasAnsweredCurrent && (
          <button type="button" className="quiz-next-btn" onClick={handleNextQuestion}>
            <span>{session.currentIndex === session.questions.length - 1 ? 'Finish' : 'Next'}</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};