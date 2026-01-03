
import { GoogleGenAI, Type } from "@google/genai";
import { QueryCategory, Sentiment, FAQ } from "../types";

export class GeminiService {
  /**
   * Returns a fresh instance of the GoogleGenAI client.
   * Per instructions, we use process.env.API_KEY directly.
   */
  private get ai() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async *generateStreamingResponse(query: string, history: any[], faqs: FAQ[]) {
    const faqContext = faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n---\n");
    
    const systemInstruction = `
      You are the Elite Student Assistant for Global Tech University.
      Knowledge Base:
      ${faqContext}
      
      Instructions:
      1. Use Knowledge Base first.
      2. If info is missing, use Google Search.
      3. Support English and Urdu.
    `;

    try {
      const stream = await this.ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: "user", parts: [{ text: query }] }
        ],
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        }
      });

      for await (const chunk of stream) {
        yield chunk.text || "";
      }
    } catch (error) {
      console.error("Gemini Stream Error:", error);
      yield "I'm having trouble connecting to my brain. Please try again.";
    }
  }

  async generateResponse(query: string, history: any[], faqs: FAQ[]): Promise<string> {
    const faqContext = faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n---\n");
    
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: "user", parts: [{ text: query }] }
        ],
        config: {
          systemInstruction: `Knowledge Base: ${faqContext}`,
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        }
      });
      return response.text || "I couldn't generate a reply.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Something went wrong on our end.";
    }
  }

  async analyzeQuery(query: string): Promise<{ category: QueryCategory; sentiment: Sentiment }> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze: "${query}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, enum: Object.values(QueryCategory) },
              sentiment: { type: Type.STRING, enum: Object.values(Sentiment) }
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
