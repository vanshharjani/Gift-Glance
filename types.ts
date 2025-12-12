export interface GiftSuggestion {
  item_name: string;
  category: 'Interest Enhancer' | 'Missing Essential';
  reasoning: string;
  amazon_link: string;
}

export interface AnalysisResult {
  persona: string;
  gifts: GiftSuggestion[];
}

export interface QuizAnswers {
  activity: string;
  complaint: string;
  vibe: string;
}

export type InputMode = 'photo' | 'quiz';

export type Relationship = 'Partner' | 'Friend' | 'Parent' | 'Sibling' | 'Colleague' | 'Child' | 'Other';