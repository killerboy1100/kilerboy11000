export enum ModelType {
  FLASH = 'gemini-2.5-flash',
  PRO = 'gemini-3-pro-preview',
  LIVE = 'gemini-2.5-flash-native-audio-preview-09-2025'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isLoading?: boolean;
  images?: string[]; // base64 strings
  groundingMetadata?: GroundingMetadata;
}

export interface GroundingMetadata {
  searchEntryPoint?: {
    renderedContent: string;
  };
  groundingChunks?: GroundingChunk[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface AppState {
  currentModel: ModelType;
  systemInstruction: string;
  useGrounding: boolean;
}
