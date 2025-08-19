// src/app/api/scan/route.ts - Enhanced version with review fetching
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function fetchReviews(roaster: string, productName: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roaster,
        productName
      })
    });

    if (!response.ok) {
      throw new Error(`Reviews API failed: ${response.status}`);
    }

    const reviewsData = await response.json();
    return reviewsData.success ? reviewsData.data : null;
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const includeReviews = formData.get('includeReviews') === 'true' // Optional parameter
    
    if (!imageFile) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 })
    }

    // Convert image to base64
    const imageBuffer = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const imageDataUrl = `data:${imageFile.type};base64,${base64Image}`

    // Call GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this coffee bag label and extract: roaster name, coffee name, origin, roast level, and flavor notes. Return ONLY valid JSON (no markdown): {"roaster": "...", "productName": "...", "origin": "...", "roastLevel": "...", "flavorNotes": ["..."]}'
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
    let extraction = {}
    
    try {
      // Clean the response - remove markdown code blocks
      let cleanResponse = aiResponse || '{}'
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      extraction = JSON.parse(cleanResponse)
    } catch (parseError) {
      extraction = {
        roaster: 'Could not parse response',
        productName: 'Could not parse response', 
        origin: 'Could not parse response',
        roastLevel: 'Could not parse response',
        flavorNotes: []
      }
    }

    const result = {
      id: Date.now().toString(),
      extraction,
      confidence: 0.9,
      processingMethod: 'vision',
      processingTime: Date.now(),
      productSearched: false,
      productFound: false,
      reviews: null
    }

    // Fetch reviews if requested and we have valid roaster/product info
    if (includeReviews && extraction.roaster && extraction.productName && 
        extraction.roaster !== 'Could not parse response' && 
        extraction.productName !== 'Could not parse response') {
      
      result.productSearched = true
      
      const reviews = await fetchReviews(extraction.roaster, extraction.productName)
      if (reviews) {
        result.reviews = reviews
        result.productFound = true
      }
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json({ success: false, error: 'AI processing failed' }, { status: 500 })
  }
}