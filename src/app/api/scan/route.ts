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
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this coffee packaging image and extract comprehensive coffee information. Look for:

ROASTER INFORMATION:
- Roaster name (company/brand)
- Roaster location/country (where the company is based)

COFFEE DETAILS:
- Product name (specific coffee name)
- Bean origin (country where beans were grown)
- Specific region/farm/estate within the origin country
- Varietal/cultivar (e.g., Bourbon, Typica, Geisha)
- Processing method (washed, natural, honey, semi-washed)
- Roast level (light, medium, dark, etc.)
- Altitude/elevation of farm
- Harvest year/crop year

FLAVOR & BREWING:
- Flavor notes or tasting notes (chocolate, citrus, etc.)
- Brewing recommendations (espresso, pour-over, french press)
- Grind recommendations
- Weight/package size
- Price (if visible)

ADDITIONAL INFO:
- Certifications (organic, fair trade, direct trade)
- Roast date (if visible)
- Best by date
- Any special processing notes

Return ONLY valid JSON with detailed information:
{
  "roaster": "Company Name",
  "roasterCountry": "Country where roaster is located",
  "productName": "Specific coffee name",
  "origin": "Bean origin country",
  "region": "Specific region/farm/estate",
  "varietal": ["Bean varieties"],
  "processingMethod": "Processing type",
  "roastLevel": "Roast level",
  "flavorNotes": ["Flavor notes"],
  "altitude": "elevation in meters",
  "harvestYear": "year",
  "brewRecommendations": ["Brewing methods"],
  "grindRecommendation": "Grind type",
  "weight": "Package size",
  "price": "Price if visible",
  "certifications": ["Any certifications"],
  "roastDate": "Date if visible",
  "additionalNotes": "Any special notes"
}`
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
        roasterCountry: 'Unable to extract',
        productName: 'Unable to extract', 
        origin: 'Unable to extract',
        region: 'Unable to extract',
        roastLevel: 'Unable to extract',
        flavorNotes: [],
        brewRecommendations: [],
        varietal: [],
        processingMethod: 'Unable to extract',
        altitude: null,
        harvestYear: null,
        weight: null,
        price: null,
        certifications: [],
        grindRecommendation: null,
        additionalNotes: null
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