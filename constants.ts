import { ModelType } from './types';

export const DEFAULT_SYSTEM_INSTRUCTION = "You are a helpful, expert AI assistant using Google's Gemini models. Be concise, accurate, and professional. Use Markdown for formatting.";

export const MODEL_OPTIONS = [
  { value: ModelType.FLASH, label: 'Gemini 2.5 Flash', description: 'Fast, efficient, versatile' },
  { value: ModelType.PRO, label: 'Gemini 3.0 Pro (Preview)', description: 'Complex reasoning, coding' },
];

export const LIVE_MODEL = ModelType.LIVE;
