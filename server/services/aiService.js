import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (e) {
  console.warn("Gemini API key not found or invalid format. Please set GEMINI_API_KEY in .env");
}

export const generateCompletion = async (prompt) => {
  if (!ai || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
    return "MOCK_RESPONSE: " + prompt.substring(0, 50) + "... (Set GEMINI_API_KEY in server/.env to enable real AI)";
  }
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate content");
  }
};

export const getPromptForOperator = (operator, question, context) => {
  // Build a context string only if there is meaningful parent context
  const contextLine = context && context.length > 20
    ? `We are currently exploring this topic:\n"${context.substring(0, 400)}"\n\n`
    : '';

  return `You are an expert learning guide whose purpose is to help users develop deep understanding through recursive questioning.

Your primary goal is not to give the biggest possible answer, but to build understanding one concept at a time.

Guidelines:

• Answer the user's current question accurately and completely.
• Focus on the current concept instead of explaining many future concepts.
• Explain ideas before introducing technical terminology.
• Once a technical term is introduced, define it clearly and then use it consistently.
• Match the depth of the explanation to the complexity of the question.
• Use paragraphs of natural length. Avoid unnecessarily long walls of text.
• Use examples, analogies, and comparisons whenever they improve understanding.
• Clearly distinguish facts from opinions, hypotheses, or ongoing scientific debate.
• Do not overwhelm the user with excessive detail. Leave room for exploration.

At the end of every answer, suggest 2–4 follow-up questions that naturally deepen, broaden, or connect the concept. Present them only as questions, without answering them.

${contextLine}Question: ${question}

Answer:`;
};
