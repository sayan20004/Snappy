import '../config/env.js'; // Load env vars first
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Debug: log the key being used
const apiKey = process.env.GEMINI_API_KEY;
console.log('🔑 Gemini API Key prefix:', (apiKey || 'MISSING').slice(0, 25));

const genAI = new GoogleGenerativeAI(apiKey);

// Generation config for better responses
const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
};

// Safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Get the Gemini Pro model for text
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
  });
};

// Get Gemini Pro Vision for multimodal (text + images)
export const getGeminiVisionModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
  });
};


// Helper to generate content with retry logic
export const generateContent = async (model, prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Helper to generate content from image
export const generateContentFromImage = async (imageData, prompt) => {
  const model = getGeminiVisionModel();
  const imageParts = [{
    inlineData: {
      data: imageData.toString('base64'),
      mimeType: 'image/jpeg'
    }
  }];
  
  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  return response.text();
};

export default genAI;
