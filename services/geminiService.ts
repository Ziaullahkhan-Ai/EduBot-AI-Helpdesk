
import { GoogleGenAI, Type } from "@google/genai";
import { QueryCategory, Sentiment, FAQ } from "../types";

const API_KEY = process.env.API_KEY || "";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async generateResponse(query: string, history: { role: string; parts: { text: string }[] }[], faqs: FAQ[]) {
    const faqContext = faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n---\n");
    
    const systemInstruction = `
      You are an elite Student Helpdesk AI Bot for "Global Tech University". 
      Your goals:
      1. Provide helpful, accurate, and polite information to students.
      2. If you are unsure, provide the contact for the specific department.
      3. Use the following FAQ context if relevant:
      ${faqContext}
      
      4. Support both English and Urdu. If the student speaks Urdu, respond in Urdu.
      5. Keep responses concise and structured.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: "user", parts: [{ text: query }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return response.text || "I am having trouble understanding. Please contact support.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "An error occurred while processing your request. Please try again later.";
    }
  }

  async analyzeQuery(query: string): Promise<{ category: QueryCategory; sentiment: Sentiment }> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following student query and return JSON only.
        Query: "${query}"
        
        Categories: Admissions, Academics, Fees & Finance, Exams, Syllabus, Technical Support, Other.
        Sentiments: Positive, Neutral, Negative.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "One of the provided categories" },
              sentiment: { type: Type.STRING, description: "One of the provided sentiments" }
            },
            required: ["category", "sentiment"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      return {
        category: (result.category as QueryCategory) || QueryCategory.OTHER,
        sentiment: (result.sentiment as Sentiment) || Sentiment.NEUTRAL
      };
    } catch (error) {
      return { category: QueryCategory.OTHER, sentiment: Sentiment.NEUTRAL };
    }
  }
}

export const gemini = new GeminiService();
