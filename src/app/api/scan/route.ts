/* -------- fetch timeout + timing patch (single-file, no imports) -------- */
if (!(globalThis as any).__fetch_patched__) {
  const _origFetch = globalThis.fetch;
  (globalThis as any).__fetch_patched__ = true;
  globalThis.fetch = (input: any, init: any = {}) => {
    const url = typeof input === "string" ? input : (input?.url ?? String(input));
    const t0 = Date.now();
    const timeoutMs = 8000;

    const ac = new AbortController();
    const userSignal = init.signal;
    const timer = setTimeout(() => ac.abort(new Error(`Timeout ${timeoutMs}ms: ${url}`)), timeoutMs);
    const nextInit = { ...init, signal: userSignal ?? ac.signal };

    return _origFetch(input as any, nextInit)
      .then((res: any) => { console.log(`[fetch] ${res.status} ${url} • ${Date.now()-t0}ms`); return res; })
      .catch((err: any) => { console.warn(`[fetch] FAIL ${url} • ${Date.now()-t0}ms • ${err?.message ?? err}`); throw err; })
      .finally(() => clearTimeout(timer));
  };
}
/* ----------------------------------------------------------------------- */
// src/app/api/scan/route.ts - Optimized for Speed
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface CoffeeExtraction {
  roaster?: string;
  productName?: string;
  origin?: string;
  region?: string;
  roastLevel?: string;
  flavorNotes?: string[];
  price?: string;
  weight?: string;
  brewRecommendations?: string[];
}

// Simplified, faster prompt for better performance
const FAST_EXTRACTION_PROMPT = `Extract key coffee information from this image. Return ONLY valid JSON:

{
  "roaster": "brand/company name",
  "productName": "specific coffee name",
  "origin": "origin country", 
  "region": "region if visible",
  "roastLevel": "light/medium/dark",
  "flavorNotes": ["note1", "note2"],
  "price": "price if visible",
  "weight": "package size if visible",
  "brewRecommendations": ["method1", "method2"]
}

Only include information clearly visible on the packaging. Use null for missing fields.`

async function fetchReviews(roaster: string, productName: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/reviews?roaster=${encodeURIComponent(roaster)}&productName=${encodeURIComponent(productName)}`;
    
    console.log(`Fetching reviews from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
      // Removed AbortSignal timeout completely
    });
    
    if (!response.ok) {
      console.error(`Reviews API failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('Reviews API response:', data);
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    const includeReviews = formData.get('includeReviews') === 'true'

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image provided' }, 
        { status: 400 }
      )
    }

    // Convert image to base64 with compression check
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')
    const imageDataUrl = `data:${image.type};base64,${base64Image}`

    // Optimized but thorough vision analysis
    const visionPromise = openai.chat.completions.create({
      model: 'gpt-4o', // Back to full model for accuracy
      max_tokens: 600,  // Increased back up
      temperature: 0.1, // Slight randomness for better extraction
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this coffee packaging and extract detailed information. Return ONLY valid JSON:

{
  "roaster": "company/brand name",
  "productName": "specific coffee name",
  "origin": "bean origin country",
  "region": "specific region/farm if visible",
  "varietal": ["bean varieties if listed"],
  "processingMethod": "washed/natural/honey etc",
  "roastLevel": "light/medium/dark etc",
  "flavorNotes": ["individual flavor notes"],
  "altitude": "elevation if mentioned",
  "harvestYear": "year if visible", 
  "price": "price if visible",
  "weight": "package size",
  "brewRecommendations": ["brewing methods if mentioned"],
  "certifications": ["organic/fair trade etc if visible"],
  "additionalNotes": "any other relevant info"
}

Extract all clearly visible information. Use null for missing fields.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl,
                detail: 'high' // Back to high detail for accuracy
              }
            }
          ]
        }
      ]
    });

    // Wait for vision analysis
    const response = await visionPromise;
    const aiResponse = response.choices[0]?.message?.content;
    
    let extraction: CoffeeExtraction = {};
    
    try {
      // Clean and parse response
      let cleanResponse = aiResponse || '{}';
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      extraction = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Minimal fallback extraction
      extraction = {
        roaster: 'Unable to extract',
        productName: 'Unable to extract', 
        origin: 'Unable to extract',
        roastLevel: 'Unable to extract',
        flavorNotes: [],
        brewRecommendations: []
      };
    }

    // Build initial result
    const result = {
      id: Date.now().toString(),
      extraction,
      confidence: 0.85, // Slightly lower confidence for faster processing
      processingMethod: 'vision' as const,
      processingTime: Date.now() - startTime,
      productSearched: false,
      productFound: false,
      reviews: null
    };

    // Handle reviews if requested
    if (includeReviews && 
        extraction.roaster && 
        extraction.productName && 
        extraction.roaster !== 'Unable to extract' && 
        extraction.productName !== 'Unable to extract') {
      
      result.productSearched = true;
      
      try {
        const reviews = await fetchReviews(extraction.roaster, extraction.productName);
        if (reviews) {
          result.reviews = reviews;
          result.productFound = true;
        }
      } catch (reviewError) {
        console.error('Review fetch failed:', reviewError);
        // Continue without reviews rather than failing the entire request
      }
    }

    console.log(`Total processing time: ${Date.now() - startTime}ms`);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { success: false, error: 'Processing failed. Please try again.' }, 
      { status: 500 }
    );
  }
}
