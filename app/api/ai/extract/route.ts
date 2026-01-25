import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite-preview-02-05', 'gemini-flash-latest'];

async function generateWithRetry(genAI: any, params: any, retries = 3) {
  let lastError;
  
  // Outer loop: Retries with delay
  for (let i = 0; i < retries; i++) {
    // Inner loop: Model Fallback strategy
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        return await model.generateContent(params);
      } catch (error: any) {
        lastError = error;
        // If 404 (Model not found) or 429/503 (Rate limit/Service Unavailable), try next model
        if (error.status === 404 || error.status === 429 || error.status === 503) {
          console.log(`Model ${modelName} failed with ${error.status}. Switching model...`);
          continue;
        }
        throw error; // Other errors (e.g. 400 Bad Request) are fatal
      }
    }

    // If we exhausted all models and still have a 429/503, wait and retry
    if ((lastError?.status === 429 || lastError?.status === 503) && i < retries - 1) {
      let delay = 2000 * Math.pow(2, i);
      try {
         const errorStr = JSON.stringify(lastError);
         const match = errorStr.match(/retryDelay"?\s*:\s*"?(\d+(\.\d+)?)s"?/);
         if (match && match[1]) {
           delay = Math.ceil(parseFloat(match[1]) * 1000) + 2000;
         }
      } catch (e) { }

      console.log(`All models rate limited. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    
    throw lastError;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;

    if (!file && !text) {
      return NextResponse.json(
        { message: 'Please provide a file or text description' },
        { status: 400 }
      );
    }

    let extractedText = '';

    if (text) {
      extractedText = text;
    }

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileType = file.type;

      if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
        // Use Gemini's multimodal capabilities for PDF and Images
        const filePart = {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: fileType,
          },
        };

        const prompt = `
          Extract the following property details from this document/image and return ONLY a JSON object.
          If a field is not found, use null or empty string.
          Fields: 
          - title, description, price, area, location, address
          - type (Residential, Commercial, Plots)
          - propertySubtype (e.g. Flats/Apartments, Villas, Office Spaces, etc.)
          - listingType (Sell, Rent, Lease)
          - mapLink, videoUrl
          - bedrooms (number), bathrooms (number), furnishing
          - possessionDate, reraId
          - amenities (array of strings), highlights (array of strings)
          - specifications (array of objects {label: string, value: string})
          - projectUnits, projectArea, configurations, avgPrice, launchDate, sizes, projectSize
          - bachelorsAllowed, maintenance, totalFloors, carParking
        `;

        const result = await generateWithRetry(genAI, [prompt, filePart]);
        const response = result.response;
        let text = response.text();
        
        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        return NextResponse.json(JSON.parse(text));
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const result = await mammoth.extractRawText({ buffer });
        extractedText += '\n' + result.value;
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileType === 'application/vnd.ms-excel'
      ) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        extractedText += '\n' + XLSX.utils.sheet_to_csv(sheet);
      }
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { message: 'Could not extract text from the provided input' },
        { status: 400 }
      );
    }

    // Text processing model
    const prompt = `
      Extract property details from the following text and return ONLY a JSON object.
      Do not include any explanation or markdown formatting (like \`\`\`json).
      
      Text to process:
      ${extractedText.substring(0, 30000)} // Limit context if needed
      
      Fields to extract (use null if not found):
      - title (Extract the EXACT "Project Name" or "Property Name" from the document. ONLY if not found, suggest a descriptive title like "3BHK Flat in Whitefield")
      - description (summarize key points)
      - price (e.g. "50 Lakh", "1.5 Cr")
      - area (e.g. "1200 sqft")
      - location (Area/City)
      - address (Full address)
      - type (Residential, Commercial, Plots)
      - propertySubtype
      - listingType (Sell, Rent, Lease)
      - mapLink, videoUrl
      - bedrooms (number), bathrooms (number)
      - furnishing (Furnished, Unfurnished, Semi-Furnished)
      - possessionDate, reraId
      - amenities (array of strings)
      - highlights (array of strings)
      - specifications (array of objects {label, value})
      - projectUnits, projectArea, configurations, avgPrice, launchDate, sizes, projectSize
      - bachelorsAllowed, maintenance, totalFloors, carParking
    `;

    const result = await generateWithRetry(genAI, prompt);
    const response = result.response;
    let jsonStr = response.text();
    
    // Clean up markdown code blocks if present
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Attempt to parse JSON
    try {
      const data = JSON.parse(jsonStr);
      return NextResponse.json(data);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      return NextResponse.json({ message: 'Failed to parse AI response', raw: jsonStr }, { status: 500 });
    }

  } catch (error) {
    console.error('AI Extraction Error:', error);
    return NextResponse.json(
      { message: 'Failed to process request', error: String(error) },
      { status: 500 }
    );
  }
}
