
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from "../types";

export const checkApiKey = async (): Promise<boolean> => {
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
     return await window.aistudio.hasSelectedApiKey();
  }
  // Fallback to checking process.env.API_KEY which is injected by the environment
  return !!process.env.API_KEY;
};

export const promptForApiKey = async () => {
  if (window.aistudio && window.aistudio.openSelectKey) {
    await window.aistudio.openSelectKey();
  } else {
    console.warn("AI Studio key selection not available in this environment.");
  }
};

const getClient = () => {
  // According to guidelines, use process.env.API_KEY directly.
  // We must create a new instance to ensure we use the latest key from the environment.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Retry helper for API calls
async function withRetry<T>(operation: () => Promise<T>, retries = 2, delayMs = 2000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const errorString = JSON.stringify(error) + (error.message || '');
    if ((errorString.includes('429') || errorString.includes('quota')) && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return withRetry(operation, retries - 1, delayMs * 2);
    }
    throw error;
  }
}

// Optimized Image Analysis (Uses tiny image to save bandwidth/tokens)
export const analyzeImage = async (base64Image: string, prompt: string): Promise<string> => {
  const client = getClient();
  
  // Resize logic inside:
  const resizeImg = (b64: string): Promise<string> => {
      return new Promise((resolve) => {
          const img = new Image();
          img.src = b64;
          img.onload = () => {
              const canvas = document.createElement('canvas');
              // Very small for analysis - saves huge amount of tokens
              const scale = 512 / Math.max(img.width, img.height);
              canvas.width = img.width * scale;
              canvas.height = img.height * scale;
              canvas.getContext('2d')?.drawImage(img, 0,0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
      });
  };

  const optimizedImage = await resizeImg(base64Image);
  const base64Data = optimizedImage.split(',')[1];

  try {
    const response = await withRetry<GenerateContentResponse>(() => client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: prompt }
        ]
      }
    }));
    return response.text || "Sin respuesta.";
  } catch (error) {
    console.error("Analyze Error:", error);
    return "El sistema de análisis está ocupado. Intenta de nuevo en unos segundos.";
  }
};

export const sendChatMessage = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  const client = getClient();
  const historyContent = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const chat = client.chats.create({
    model: 'gemini-3-flash-preview',
    history: historyContent,
    config: { systemInstruction: "Eres un experto técnico en serigrafía y diseño gráfico (DTF, Separación de color)." }
  });

  try {
    const result = await withRetry<GenerateContentResponse>(() => chat.sendMessage({ message: newMessage }));
    return result.text || "";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Error de conexión con el asistente.";
  }
};
