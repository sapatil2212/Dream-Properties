import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite-preview-02-05', 'gemini-flash-latest'];

async function generateWithRetry(genAI: any, params: any, retries = 3) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        return await model.generateContent(params);
      } catch (error: any) {
        lastError = error;
        if (error.status === 404 || error.status === 429 || error.status === 503) {
           console.log(`Model ${modelName} failed with ${error.status}. Switching...`);
           continue;
        }
        throw error;
      }
    }

    if ((lastError?.status === 429 || lastError?.status === 503) && i < retries - 1) {
        let delay = 2000 * Math.pow(2, i);
        
        try {
           const errorStr = JSON.stringify(lastError);
           const match = errorStr.match(/retryDelay"?\s*:\s*"?(\d+(\.\d+)?)s"?/);
           if (match && match[1]) {
             delay = Math.ceil(parseFloat(match[1]) * 1000) + 2000;
           }
        } catch (e) { }

        console.log(`AI Rate limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw lastError;
    }
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text input is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const prompt = `
      You are a real estate assistant. Extract and categorize the following text into "amenities", "highlights", and "specifications".
      
      - Amenities: General facilities like Swimming Pool, Gym, Club House, Garden, etc.
      - Highlights: Key selling points like "Near Metro", "Vastu Compliant", "No Common Walls", etc.
      - Specifications: Technical details with labels and values (e.g., "Flooring: Vitrified Tiles", "Windows: UPVC").

      Return ONLY a valid JSON object with the following structure:
      {
        "amenities": ["string", "string"],
        "highlights": ["string", "string"],
        "specifications": [
          { "label": "string", "value": "string" }
        ]
      }

      Input text:
      "${text}"
    `;

    const result = await generateWithRetry(genAI, prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean up the response to ensure it's valid JSON
    // Sometimes Gemini returns markdown code blocks like ```json ... ```
    const cleanedResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const jsonResponse = JSON.parse(cleanedResponse);
      return NextResponse.json({
        success: true,
        data: jsonResponse
      });
    } catch (e) {
      console.error('Failed to parse AI response:', textResponse);
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('AI Generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
