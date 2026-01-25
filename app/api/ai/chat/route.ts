import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite-preview-02-05', 'gemini-flash-latest'];

async function sendMessageWithRetry(genAI: any, history: any, message: string, systemInstruction: any, retries = 3) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({
          history: history || [],
          generationConfig: { maxOutputTokens: 500 },
          systemInstruction: systemInstruction
        });
        return await chat.sendMessage(message);
      } catch (error: any) {
        lastError = error;
        if (error.status === 404 || error.status === 429 || error.status === 503) {
           console.log(`Chat Model ${modelName} failed with ${error.status}. Switching...`);
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
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { message: 'Message is required' },
        { status: 400 }
      );
    }

    // Ensure history is valid and starts with a user message
    let validHistory = Array.isArray(history) ? history : [];
    
    // Remove any leading model messages as Gemini requires the conversation to start with 'user'
    while (validHistory.length > 0 && validHistory[0].role !== 'user') {
      validHistory.shift();
    }

    const systemInstruction = {
        role: "user",
        parts: [{ text: "You are the Dream Properties AI Assistant. Your goal is to help users (Builders, Agents, Admins) navigate the dashboard, understand features, and manage their real estate business. Be concise, professional, and helpful. You can guide them on how to post properties, manage leads, and use the platform. If asked about specific data, explain that you can't access their live database directly but can guide them where to find it." }]
    };

    const result = await sendMessageWithRetry(genAI, validHistory, message, systemInstruction);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { message: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
