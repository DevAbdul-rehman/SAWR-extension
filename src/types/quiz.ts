export interface QuizQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ActiveQuizSession {
  questions: QuizQuestion[];
  currentIndex: number;
  selectedAnswers: Record<number, number>;
  score: number;
  isCompleted: boolean;
}

export interface WeakTopicAnalysis {
  topic: string;
  missedQuestions: string[];
}