// src/app/api/scan/route.ts
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
  farm?: string;
  varietal?: string[];
  processingMethod?: string;
  roastLevel?: string;
  flavorNotes?: string[];
  altitude?: number;
  harvestYear?: number;
  price?: string;
  weight?: string;
  brewRecommendations?: string[];
}

async function fetchReviews(roaster: string, productName: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/reviews?roaster=${encodeURIComponent(roaster)}&productName=${encodeURIComponent(productName)}`;
    
    console.log(`Fetching reviews from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`Reviews API failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
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

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')
    const imageDataUrl = `data:${image.type};base64,${base64Image}`

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this coffee packaging image and extract coffee information. Look for:
- Roaster name (company/brand)
- Product name (specific coffee name)
- Origin (country/region)
- Roast level (light, medium, dark, etc.)
- Flavor notes or tasting notes
- Processing method (washed, natural, etc.)
- Any other visible details

Return ONLY valid JSON (no markdown): {"roaster": "...", "productName": "...", "origin": "...", "roastLevel": "...", "flavorNotes": ["..."], "processingMethod": "...", "altitude": null, "weight": "...", "price": "..."}`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl
              }
            }
          ]
        }
      ]
    })

    const aiResponse = response.choices[0]?.message?.content
    let extraction: CoffeeExtraction = {}
    
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanResponse = aiResponse || '{}'
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      extraction = JSON.parse(cleanResponse)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      extraction = {
        roaster: 'Unable to extract',
        productName: 'Unable to extract', 
        origin: 'Unable to extract',
        roastLevel: 'Unable to extract',
        flavorNotes: []
      }
    }

    // Build result object
    const result = {
      id: Date.now().toString(),
      extraction,
      confidence: 0.9,
      processingMethod: 'vision' as const,
      processingTime: Date.now(),
      productSearched: false,
      productFound: false,
      reviews: null
    }

    // Fetch reviews if requested and we have valid extraction data
    if (includeReviews && 
        extraction.roaster && 
        extraction.productName && 
        extraction.roaster !== 'Unable to extract' && 
        extraction.productName !== 'Unable to extract') {
      
      result.productSearched = true
      
      try {
        const reviews = await fetchReviews(extraction.roaster, extraction.productName)
        if (reviews) {
          result.reviews = reviews
          result.productFound = true
        }
      } catch (reviewError) {
        console.error('Review fetch failed:', reviewError)
        // Continue without reviews rather than failing the entire request
      }
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json(
      { success: false, error: 'AI processing failed' }, 
      { status: 500 }
    )
  }
}