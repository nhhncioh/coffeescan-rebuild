import OpenAI from 'openai'
import { VisionExtractionResult, CoffeeExtraction } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface VisionOptions {
  extractionDepth?: 'basic' | 'detailed'
  model?: string
  maxTokens?: number
}

const VISION_PROMPT_BASIC = `
You are a coffee expert analyzing a coffee bag label. Extract the following information from the image:

1. Roaster/Brand name
2. Coffee product name
3. Origin (country/region)
4. Roast level
5. Basic flavor notes (if visible)

Return ONLY a JSON object with this structure:
{
  "roaster": "string or null",
  "productName": "string or null", 
  "origin": "string or null",
  "roastLevel": "string or null",
  "flavorNotes": ["array of strings or empty array"]
}

Be precise and only include information you can clearly see on the label.
`

const VISION_PROMPT_DETAILED = `
You are an expert coffee analyst examining a coffee bag label. Extract ALL visible information with high precision:

REQUIRED FIELDS:
- Roaster/Brand name
- Coffee product name  
- Origin (country, region, farm if visible)
- Roast level
- Processing method (washed, natural, honey, etc.)
- Flavor/tasting notes
- Varietal/cultivar
- Altitude (if mentioned)
- Harvest year (if mentioned)
- Price (if visible)
- Weight/size (if visible)
- Any brewing recommendations

Return ONLY a JSON object with this exact structure:
{
  "roaster": "string or null",
  "productName": "string or null",
  "origin": "string or null", 
  "region": "string or null",
  "farm": "string or null",
  "varietal": ["array of strings or empty array"],
  "processingMethod": "string or null",
  "roastLevel": "string or null", 
  "flavorNotes": ["array of strings or empty array"],
  "altitude": "number or null (in meters)",
  "harvestYear": "number or null",
  "price": "string or null (include currency if visible)",
  "weight": "string or null",
  "brewRecommendations": ["array of strings or empty array"]
}

IMPORTANT:
- Only include information clearly visible on the label
- For arrays, include individual items (e.g., ["chocolate", "caramel"] not ["chocolate, caramel"])
- For altitude, convert to meters if in feet
- Be conservative - if uncertain, use null
- Standardize roast levels: light, medium-light, medium, medium-dark, dark
- Standardize processing: washed, natural, honey, wet-hulled, experimental
`

export async function extractWithVision(
  imageBuffer: Buffer,
  options: VisionOptions = {}
): Promise<VisionExtractionResult> {
  const {
    extractionDepth = 'detailed',
    model = 'gpt-4o',
    maxTokens = 1000
  } = options

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64')
    const imageDataUrl = `data:image/jpeg;base64,${base64Image}`

    // Choose prompt based on extraction depth
    const prompt = extractionDepth === 'basic' ? VISION_PROMPT_BASIC : VISION_PROMPT_DETAILED

    console.log('Calling OpenAI Vision API...')
    const response = await openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.1, // Low temperature for consistent extraction
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl,
                detail: 'high'
              }
            }
          ]
        }
      ]
    })

    const rawResponse = response.choices[0]?.message?.content
    if (!rawResponse) {
      throw new Error('No response from vision API')
    }

    console.log('Vision API raw response:', rawResponse)

    // Parse JSON response
    let structuredData: CoffeeExtraction
    try {
      // Clean the response - remove any markdown formatting
      const cleanedResponse = rawResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      structuredData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse vision response as JSON:', parseError)
      console.error('Raw response:', rawResponse)
      
      // Fallback: try to extract some basic info using regex
      structuredData = extractFallbackData(rawResponse)
    }

    // Calculate confidence based on how much data was extracted
    const confidence = calculateExtractionConfidence(structuredData)

    // Clean and validate the extracted data
    const cleanedData = cleanExtractionData(structuredData)

    return {
      rawResponse,
      structuredData: cleanedData,
      confidence,
      tokensUsed: response.usage?.total_tokens
    }

  } catch (error) {
    console.error('Vision extraction error:', error)
    throw new Error(`Vision API failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function extractFallbackData(text: string): CoffeeExtraction {
  // Basic regex patterns to extract common coffee information
  const roasterMatch = text.match(/(?:roaster|brand)[:\s]+([^\n,]+)/i)
  const originMatch = text.match(/(?:origin|from)[:\s]+([^\n,]+)/i)
  const roastMatch = text.match(/(?:roast|roasted)[:\s]+(light|medium|dark)[^\n]*/i)
  
  return {
    roaster: roasterMatch?.[1]?.trim() || null,
    origin: originMatch?.[1]?.trim() || null,
    roastLevel: roastMatch?.[1]?.trim() || null,
    flavorNotes: []
  }
}

function calculateExtractionConfidence(data: CoffeeExtraction): number {
  let score = 0
  let maxScore = 0

  // Weight different fields by importance
  const fieldWeights = {
    roaster: 0.3,
    productName: 0.2,
    origin: 0.2,
    roastLevel: 0.1,
    flavorNotes: 0.1,
    processingMethod: 0.05,
    varietal: 0.05
  }

  for (const [field, weight] of Object.entries(fieldWeights)) {
    maxScore += weight
    const value = (data as any)[field]
    
    if (field === 'flavorNotes' || field === 'varietal') {
      if (Array.isArray(value) && value.length > 0) {
        score += weight
      }
    } else if (value && typeof value === 'string' && value.trim().length > 0) {
      score += weight
    } else if (typeof value === 'number' && value > 0) {
      score += weight
    }
  }

  return Math.min(score / maxScore, 1)
}

function cleanExtractionData(data: CoffeeExtraction): CoffeeExtraction {
  const cleaned: CoffeeExtraction = {}

  // Clean string fields
  const stringFields = ['roaster', 'productName', 'origin', 'region', 'farm', 'processingMethod', 'roastLevel', 'price', 'weight']
  
  for (const field of stringFields) {
    const value = (data as any)[field]
    if (typeof value === 'string' && value.trim().length > 0) {
      // Clean up common OCR/Vision errors
      let cleanedValue = value.trim()
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .replace(/\s+/g, ' ')
      
      // Remove common prefixes
      if (field === 'roaster') {
        cleanedValue = cleanedValue.replace(/^(roasted by|by|from)\s+/i, '')
      }
      
      (cleaned as any)[field] = cleanedValue
    }
  }

  // Clean array fields
  const arrayFields = ['flavorNotes', 'varietal', 'brewRecommendations']
  
  for (const field of arrayFields) {
    const value = (data as any)[field]
    if (Array.isArray(value)) {
      const cleanedArray = value
        .filter(item => typeof item === 'string' && item.trim().length > 0)
        .map(item => item.trim())
        .filter(item => item.length > 0 && item.length < 50) // Remove very long items
        .slice(0, 10) // Limit array size
      
      if (cleanedArray.length > 0) {
        (cleaned as any)[field] = [...new Set(cleanedArray)] // Remove duplicates
      }
    }
  }

  // Clean numeric fields
  if (typeof data.altitude === 'number' && data.altitude > 0 && data.altitude < 10000) {
    cleaned.altitude = Math.round(data.altitude)
  }

  if (typeof data.harvestYear === 'number' && data.harvestYear > 1900 && data.harvestYear <= new Date().getFullYear()) {
    cleaned.harvestYear = data.harvestYear
  }

  // Standardize roast level
  if (cleaned.roastLevel) {
    const roastLevel = cleaned.roastLevel.toLowerCase()
    if (roastLevel.includes('light')) {
      cleaned.roastLevel = roastLevel.includes('medium') ? 'medium-light' : 'light'
    } else if (roastLevel.includes('dark')) {
      cleaned.roastLevel = roastLevel.includes('medium') ? 'medium-dark' : 'dark'
    } else if (roastLevel.includes('medium')) {
      cleaned.roastLevel = 'medium'
    }
  }

  // Standardize processing method
  if (cleaned.processingMethod) {
    const processing = cleaned.processingMethod.toLowerCase()
    if (processing.includes('washed') || processing.includes('wet')) {
      cleaned.processingMethod = 'washed'
    } else if (processing.includes('natural') || processing.includes('dry')) {
      cleaned.processingMethod = 'natural'
    } else if (processing.includes('honey') || processing.includes('pulped natural')) {
      cleaned.processingMethod = 'honey'
    } else if (processing.includes('wet hulled') || processing.includes('giling basah')) {
      cleaned.processingMethod = 'wet-hulled'
    } else if (processing.includes('experimental') || processing.includes('anaerobic')) {
      cleaned.processingMethod = 'experimental'
    }
  }

  return cleaned
}

// Test function for development
export async function testVisionExtraction(imagePath: string): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Test function only available in development')
  }

  try {
    const fs = await import('fs')
    const imageBuffer = fs.readFileSync(imagePath)
    
    console.log('Testing vision extraction...')
    const result = await extractWithVision(imageBuffer, { extractionDepth: 'detailed' })
    
    console.log('Extraction result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('Test failed:', error)
  }
}