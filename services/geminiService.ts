
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QueryCategory, Sentiment, FAQ } from "../types";

// Always initialize the client using the named parameter 'apiKey' from process.env.API_KEY.
// We use a class with a private getter to ensure a fresh client instance can be retrieved
// while adhering to initialization guidelines.

export class GeminiService {
  /**
   * Returns a fresh instance of the GoogleGenAI client using the configured API key.
   */
  private get ai() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Generates a streaming response for the main chat interface.
   */
  async *generateStreamingResponse(query: string, history: any[], faqs: FAQ[]) {
    const faqContext = faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n---\n");
    
    const systemInstruction = `
      You are the Elite Student Assistant for Global Tech University.
      Knowledge Base (Use this first):
      ${faqContext}
      
      Instructions:
      1. Be professional, empathetic, and concise.
      2. If asked about university news or events NOT in the knowledge base, use Google Search.
      3. Support English and Urdu seamlessly.
      4. If a student is angry, be extra apologetic and offer to escalate to a human.
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
        // Access the text property directly on the response chunk.
        yield chunk.text || "";
      }
    } catch (error) {
      console.error("Gemini Stream Error:", error);
      yield "System is currently overwhelmed. Please try again in a moment.";
    }
  }

  /**
   * Generates a non-streaming response for background tasks or integration simulators.
   * Fixes error: Property 'generateResponse' does not exist on type 'GeminiService'.
   */
  async generateResponse(query: string, history: any[], faqs: FAQ[]): Promise<string> {
    const faqContext = faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join("\n---\n");
    
    const systemInstruction = `
      You are the Elite Student Assistant for Global Tech University.
      Knowledge Base (Use this first):
      ${faqContext}
      
      Instructions:
      1. Be professional, empathetic, and concise.
      2. If asked about university news or events NOT in the knowledge base, use Google Search.
      3. Support English and Urdu seamlessly.
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
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        }
      });

      // Access the text property directly on the response object.
      return response.text || "I am sorry, I could not generate a response.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "System is currently overwhelmed. Please try again in a moment.";
    }
  }

  /**
   * Fast analysis for background metadata processing using structured JSON output.
   */
  async analyzeQuery(query: string): Promise<{ category: QueryCategory; sentiment: Sentiment }> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the student query for helpdesk categorization: "${query}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { 
                type: Type.STRING, 
                enum: Object.values(QueryCategory),
                description: "The department this query belongs to" 
              },
              sentiment: { 
                type: Type.STRING, 
                enum: Object.values(Sentiment),
                description: "Emotional tone of the student" 
              }
            },
            required: ["category", "sentiment"]
          }
        }
      });

      // Access the text property directly on the response object.
      const result = JSON.parse(response.text || "{}");
      return {
        category: (result.category as QueryCategory) || QueryCategory.OTHER,
        sentiment: (result.sentiment as Sentiment) || Sentiment.NEUTRAL
      };
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return { category: QueryCategory.OTHER, sentiment: Sentiment.NEUTRAL };
    }
  }
}

export const gemini = new GeminiService();
