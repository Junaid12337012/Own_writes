


import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL } from '../constants';
import { AiContentSuggestion, GeneratedImage, OutlineItem, AiFirstDraft, Comment } from '../types';

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY || process.env.API_KEY === "YOUR_GEMINI_API_KEY") {
      console.error("Gemini API Key is not configured. AI features will be disabled.");
      throw new Error("Gemini API Key not configured.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

const parseJsonFromText = (text: string): any => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", text);
    throw new Error("Invalid JSON response from AI.");
  }
};

const stripHtml = (html: string): string => {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  } catch (e) {
    console.error("Error stripping HTML:", e);
    return html; // Fallback to original html if parsing fails
  }
};

export const geminiService = {
    improveWriting: async (text: string): Promise<string> => {
        const client = getAiClient();
        const prompt = `You are an expert editor. Review the following text and improve it for clarity, grammar, flow, and impact, while preserving the original meaning. Return only the improved text, with no commentary or quotation marks.
        
Original text: "${text}"
        
Improved text:`;
        
        const response: GenerateContentResponse = await client.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
            config: { temperature: 0.5 }
        });
        
        return response.text.trim();
    },
    
    changeTone: async (text: string, tone: 'professional' | 'casual' | 'witty' | 'confident'): Promise<string> => {
        const client = getAiClient();
        const prompt = `You are a master of tone. Rewrite the following text in a ${tone} tone. Keep the core message intact. Return only the rewritten text, with no commentary or quotation marks.

Original text: "${text}"

Rewritten text in a ${tone} tone:`;

        const response: GenerateContentResponse = await client.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
            config: { temperature: 0.8 }
        });

        return response.text.trim();
    },

    summarizeSelection: async (text: string): Promise<string> => {
        const client = getAiClient();
        const prompt = `Summarize the following text into one or two concise sentences. Capture the main point effectively. Return only the summary text, with no commentary.

Original text: "${text}"

Summary:`;
        
        const response: GenerateContentResponse = await client.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
        });

        return response.text.trim();
    },

  generateFirstDraft: async (topic: string): Promise<AiFirstDraft> => {
      const client = getAiClient();
      const prompt = `Generate a complete blog post draft based on the topic: "${topic}".
The response must be a single, valid JSON object with two keys: "title" and "content".
- The "title" should be a creative and engaging blog post title.
- The "content" should be well-structured HTML for a blog post. It must include an introductory paragraph, at least two main sections using <h2> tags, with each section containing paragraphs (<p>) and potentially sub-headings (<h3>) or unordered lists (<ul><li>...</li></ul>). Conclude with a summary paragraph.
Ensure the HTML is clean and ready for direct insertion into a content editor.
Do not include <html>, <head>, or <body> tags.`;

      const response: GenerateContentResponse = await client.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const draft = parseJsonFromText(response.text) as AiFirstDraft;
      if (!draft.title || !draft.content) {
        throw new Error("AI returned an invalid draft structure.");
      }
      return draft;
  },
  
  generateMetaDescription: async (title: string, htmlContent: string): Promise<string> => {
    const client = getAiClient();
    const plainTextContent = stripHtml(htmlContent).substring(0, 1500); // Limit content length
    const prompt = `Based on the following blog post title and content, generate a concise, SEO-friendly meta description. The description should be a single, compelling sentence or two, around 150-160 characters long. It should accurately summarize the content and entice users to click.
Title: "${title}"
Content: "${plainTextContent}"
Return only the meta description text, with no extra formatting or labels.`;
    
    const response: GenerateContentResponse = await client.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
    });
    
    return response.text.replace(/"/g, '').trim(); // Clean up potential quotes
  },

  getContentSuggestions: async (promptText: string, currentHtmlContent: string): Promise<AiContentSuggestion[]> => {
    try {
      const client = getAiClient();
      // Prioritize promptText (e.g. title) and supplement with stripped HTML content
      const plainContent = stripHtml(currentHtmlContent).substring(0, 500); // Limit length of stripped content
      
      const fullPrompt = `Provide 3 brief content suggestions or continuations based on the blog title/topic: "${promptText}" and optionally the existing content snippet: "${plainContent}". Each suggestion should be a single sentence or a short phrase, suitable for direct insertion as a new paragraph or idea. Format as a JSON array of strings.
      Suggestions:`;

      const response: GenerateContentResponse = await client.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: fullPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });
      
      const suggestions = parseJsonFromText(response.text) as string[];
      return suggestions.map(s => ({ suggestion: s }));

    } catch (error) {
      console.error("Error getting content suggestions:", error);
      if (error instanceof Error && error.message.includes("API Key not valid")) {
         return [{ suggestion: "Error: Gemini API Key is not valid. Please check your configuration."}];
      }
      return [{ suggestion: "AI suggestions currently unavailable." }];
    }
  },

  generateFeaturedImage: async (textPrompt: string): Promise<GeneratedImage | null> => {
    try {
      const client = getAiClient();
      const response = await client.models.generateImages({
        model: GEMINI_IMAGE_MODEL,
        prompt: `Generate a visually appealing, high-quality featured image for a blog post. Theme/content: "${textPrompt}". Style: cinematic, detailed, suitable for a blog header. Avoid text unless explicitly part of the theme.`,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return {
          base64Image: `data:image/jpeg;base64,${base64ImageBytes}`,
          promptUsed: textPrompt,
        };
      }
      return null;
    } catch (error) {
      console.error("Error generating featured image:", error);
      if (error instanceof Error && error.message.includes("API Key not valid")) {
         return { base64Image: "error_api_key", promptUsed: "Error: Gemini API Key is not valid."};
      }
      return null;
    }
  },
  
  summarizeText: async (htmlText: string): Promise<string> => {
    try {
      const client = getAiClient();
      const plainText = stripHtml(htmlText);
      const response: GenerateContentResponse = await client.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: `Summarize the following text concisely for a blog excerpt: "${plainText}"`,
      });
      return response.text;
    } catch (error) {
      console.error("Error summarizing text:", error);
      return "Summary unavailable.";
    }
  },

  getRelatedTopics: async (htmlText: string): Promise<string[]> => {
    try {
      const client = getAiClient();
      const plainText = stripHtml(htmlText);
      const response: GenerateContentResponse = await client.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: `Based on the following text, suggest 3-5 related topics or keywords. Return as a JSON array of strings: "${plainText}"`,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      return parseJsonFromText(response.text) as string[];
    } catch (error) {
      console.error("Error getting related topics:", error);
      return [];
    }
  },

  generateBlogPostIdeas: async (topic: string): Promise<string[]> => {
    try {
      const client = getAiClient();
      const response: GenerateContentResponse = await client.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: `Generate 5 creative blog post titles or brief ideas based on the following topic or keywords. Each idea should be concise and engaging. Return as a JSON array of strings: "${topic}"`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.8, 
        }
      });
      
      const ideas = parseJsonFromText(response.text) as string[];
      if (ideas.some(idea => idea.toLowerCase().includes("error") || idea.toLowerCase().includes("unable"))) {
        console.warn("Gemini might have returned an error message within the ideas array:", ideas);
      }
      return ideas;
    } catch (error) {
      console.error("Error generating blog post ideas:", error);
      if (error instanceof Error && error.message.includes("API Key not valid")) {
         return ["Error: Gemini API Key is not valid. Please check your configuration."];
      }
      if (error instanceof Error && (error.message.toLowerCase().includes("quota") || error.message.toLowerCase().includes("rate limit"))) {
        return ["AI idea generation temporarily unavailable due to high demand. Please try again later."];
      }
      return ["AI idea generation currently unavailable. Please try again later."];
    }
  },

  generatePostOutline: async (topic: string): Promise<OutlineItem[]> => {
    try {
      const client = getAiClient();
      const prompt = `Generate a structured blog post outline for the topic: "${topic}". 
The outline should include main sections (as 'h2'), potential sub-sections (as 'h3' or 'h4'), and key bullet points (as 'point') under them. 
Return the outline as a JSON array of objects. Each object must have a 'type' (string: 'h2', 'h3', 'h4', or 'point') and a 'text' (string) property. 
Nested items (like points under a heading, or sub-headings under a main heading) should be in a 'children' array of similar objects within their parent object.
Ensure the entire response is a single valid JSON array.

Example: 
[
  { "type": "h2", "text": "Introduction", "children": [
      { "type": "point", "text": "Brief overview of ${topic}" },
      { "type": "point", "text": "Importance/relevance" }
    ]
  },
  { "type": "h2", "text": "Main Section 1", "children": [
      { "type": "h3", "text": "Subsection 1.1", "children": [
          { "type": "point", "text": "Detail A" },
          { "type": "point", "text": "Detail B" }
        ]
      },
      { "type": "point", "text": "Key takeaway for Main Section 1" }
    ]
  },
  { "type": "h2", "text": "Conclusion", "children": [
      { "type": "point", "text": "Summary of key points" },
      { "type": "point", "text": "Call to action or final thoughts" }
    ]
  }
]`;

      const response: GenerateContentResponse = await client.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5,
        }
      });

      const outline = parseJsonFromText(response.text) as OutlineItem[];
      // Basic validation
      if (!Array.isArray(outline) || outline.some(item => typeof item.type !== 'string' || typeof item.text !== 'string')) {
        console.error("AI returned an invalid outline structure:", outline);
        return [{type: "h2", text: "Error: AI returned an invalid outline structure. Please try again."}];
      }
      return outline;
    } catch (error) {
      console.error("Error generating post outline:", error);
      if (error instanceof Error && error.message.includes("API Key not valid")) {
         return [{type: "h2", text: "Error: Gemini API Key is not valid. Please check your configuration."}];
      }
      return [{type: "h2", text: "AI outline generation currently unavailable. Please try again later."}];
    }
  },

  askTheWeb: async (prompt: string): Promise<GenerateContentResponse> => {
      const client = getAiClient();
      
      const response: GenerateContentResponse = await client.models.generateContent({
          model: GEMINI_TEXT_MODEL, // The model supports search grounding
          contents: prompt,
          config: {
              tools: [{googleSearch: {}}],
          },
      });
      
      return response;
  },

  generateTextShotImage: async (selectedText: string): Promise<GeneratedImage | null> => {
    try {
      const client = getAiClient();
      const prompt = `Create a visually appealing image with the following text prominently and beautifully displayed on it: "${selectedText}". The style should be modern, elegant, and highly shareable, suitable for social media quote cards. Emphasize clarity and readability of the text. Aspect ratio can be 1:1 or 16:9. No additional text other than the quote itself.`;
      
      const response = await client.models.generateImages({
        model: GEMINI_IMAGE_MODEL,
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return {
          base64Image: `data:image/jpeg;base64,${base64ImageBytes}`,
          promptUsed: selectedText, // Or the full prompt if preferred
        };
      }
      return null;
    } catch (error) {
      console.error("Error generating text shot image:", error);
      if (error instanceof Error && error.message.includes("API Key not valid")) {
         return { base64Image: "error_api_key", promptUsed: "Error: Gemini API Key is not valid."};
      }
      return null;
    }
  },
  
  summarizeComments: async (comments: Comment[]): Promise<string> => {
    const client = getAiClient();
    
    // Flatten comments and replies into a single list of text content
    const commentTexts = comments.flatMap(c => {
      const parentComment = `User "${c.userName}" said: ${stripHtml(c.content)}`;
      const replyComments = c.replies ? c.replies.map(r => `In reply, User "${r.userName}" said: ${stripHtml(r.content)}`) : [];
      return [parentComment, ...replyComments];
    });

    if (commentTexts.length === 0) {
      return "There are no comments to summarize.";
    }

    const prompt = `You are an expert at analyzing discussions. Below is a list of comments from a blog post. Please summarize the key themes, main points of agreement or disagreement, and the overall sentiment of the discussion. Provide the summary as a few concise bullet points. Start each bullet point with a '*'.

Comments:
---
${commentTexts.join('\n---\n')}
---

Summary:`;
    
    const response: GenerateContentResponse = await client.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: { temperature: 0.3 }
    });
    
    return response.text.trim();
  },
};