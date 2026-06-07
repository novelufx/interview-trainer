export type Difficulty = '简单' | '中等' | '困难';

export type MasteryStatus = '未开始' | '不熟' | '一般' | '已掌握';

// V3: AI score result
export interface AiScoreDimension {
  name: string;
  score: number;
}

export interface AiScoreResult {
  dimensions: AiScoreDimension[];
  totalScore: number;
  strengths: string;
  weaknesses: string;
  suggestions: string;
  rawText?: string;
}

// V3: AI settings stored in localStorage
export interface AiSettings {
  baseURL: string;
  apiKey: string;
  model: string;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  baseURL: '',
  apiKey: '',
  model: '',
};

export interface InterviewQuestion {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: Difficulty;
  answerPoints: string[];
  referenceAnswer: string;
  userAnswer: string;
  favorite: boolean;
  masteryStatus: MasteryStatus;
  createdAt: string;
  updatedAt: string;
  // V3: optional review fields — old data simply won't have them
  nextReviewAt?: string;
  lastReviewedAt?: string;
  reviewCount?: number;
  // V3: optional AI results
  aiOptimizedAnswer?: string;
  aiScore?: AiScoreResult;
}

export const DIFFICULTY_OPTIONS: Difficulty[] = ['简单', '中等', '困难'];

export const MASTERY_OPTIONS: MasteryStatus[] = ['未开始', '不熟', '一般', '已掌握'];
