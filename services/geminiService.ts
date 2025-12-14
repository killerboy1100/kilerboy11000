import { GoogleGenAI, Type, Chat, GenerateContentResponse, Part } from "@google/genai";
import { ModelType } from "../types";

// Ensure API key is available
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY environment variable is missing.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

interface SendMessageOptions {
  model: ModelType;
  history: { role: 'user' | 'model'; parts: Part[] }[];
  message: string;
  images?: string[]; // base64
  systemInstruction?: string;
  useGrounding?: boolean;
}

export const sendMessageStream = async function* (options: SendMessageOptions) {
  const { model, history, message, images, systemInstruction, useGrounding } = options;

  const chatOptions: any = {
    model: model,
    config: {
      systemInstruction: systemInstruction,
    },
    history: history,
  };

  if (useGrounding) {
    chatOptions.config.tools = [{ googleSearch: {} }];
  }

  const chat: Chat = ai.chats.create(chatOptions);

  const parts: Part[] = [];
  
  if (images && images.length > 0) {
    images.forEach(img => {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg', 
          data: img
        }
      });
    });
  }
  
  parts.push({ text: message });

  const result = await chat.sendMessageStream({ message: parts });

  for await (const chunk of result) {
    yield chunk as GenerateContentResponse;
  }
};

export const getGeminiClient = () => ai;
