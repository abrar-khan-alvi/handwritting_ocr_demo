import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  // CORS headers just in case
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
     return res.status(200).json({ status: "ok" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, error: "No image data provided" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "GEMINI_API_KEY is not configured in the server environment. Please define it in your Secrets panel or Vercel Environment Variables."
      });
    }

    // Initialize Gemini Client
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const imagePart = {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: image,
      },
    };

    const promptPart = {
      text: `You are a high-performance handwriting recognition OCR system.
Analyze the provided image and extract all text content carefully.
Keep the exact spelling, case, and line-by-line structure. 
Return the output as a valid JSON object matching the requested schema.
If there are words that are particularly messy, smudged, or difficult to decode, populate the difficultWords array with context, suggestions, and original guesses.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [imagePart, promptPart],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcribedText: { type: Type.STRING },
            formattedText: { type: Type.STRING },
            confidenceRating: { type: Type.STRING },
            detectedLanguage: { type: Type.STRING },
            difficultWords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                  context: { type: Type.STRING }
                },
                required: ["word", "suggestion", "context"]
              }
            }
          },
          required: ["transcribedText", "formattedText", "confidenceRating", "detectedLanguage"]
        }
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No transcription response returned from Gemini.");
    }

    const result = JSON.parse(responseText.trim());
    return res.status(200).json({ success: true, result });
  } catch (error: any) {
    console.error("OCR processing error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "An error occurred during handwriting transcription."
    });
  }
}
