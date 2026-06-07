import type { InterviewQuestion } from '../types/question';

const STORAGE_KEY = 'interview_trainer_questions';
const SELECTED_KEY = 'interview_trainer_selected_id';

export function hasStoredData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export function loadQuestions(): InterviewQuestion[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as InterviewQuestion[];
    }
    return [];
  } catch {
    return [];
  }
}

export function saveQuestions(questions: InterviewQuestion[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
}

export function loadSelectedId(): string | null {
  return localStorage.getItem(SELECTED_KEY);
}

export function saveSelectedId(id: string | null): void {
  if (id) {
    localStorage.setItem(SELECTED_KEY, id);
  } else {
    localStorage.removeItem(SELECTED_KEY);
  }
}
