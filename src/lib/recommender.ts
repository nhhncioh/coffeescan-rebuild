// Coffee recommendation engine
import { CoffeeRecommendation, CoffeeExtraction, RoasterMatch } from '@/types'

interface RecommendationInput {
  extraction: CoffeeExtraction
  roasterMatch?: RoasterMatch | null
  maxResults?: number
}

export async function generateRecommendations(
  input: RecommendationInput
): Promise<CoffeeRecommendation[]> {
  // TODO: Implement recommendation algorithm
  // For now, return mock recommendations to prevent build errors
  
  console.warn('Recommendation engine not yet implemented')
  
  const { maxResults = 6 } = input
  
  // Mock recommendations for testing
  const mockRecommendations: CoffeeRecommendation[] = [
    {
      id: 1,
      coffee: {
        id: 1,
        name: 'Similar Ethiopian Single Origin',
        roaster: {
          name: 'Local Coffee Co.',
          location: 'Portland, OR'
        },
        origin: 'Ethiopia',
        roastLevel: 'light',
        flavorNotes: ['blueberry', 'chocolate', 'floral'],
        price: 18.99,
        imageUrl: null
      },
      similarityScore: 0.85,
      reason: 'Similar origin and flavor profile',
      type: 'content'
    },
    {
      id: 2, 
      coffee: {
        id: 2,
        name: 'House Blend Medium Roast',
        roaster: {
          name: 'City Roasters',
          location: 'Seattle, WA'
        },
        origin: 'Blend',
        roastLevel: 'medium',
        flavorNotes: ['caramel', 'nuts', 'chocolate'],
        price: 16.50,
        imageUrl: null
      },
      similarityScore: 0.72,
      reason: 'Popular choice for similar taste preferences',
      type: 'collaborative'
    }
  ]
  
  return mockRecommendations.slice(0, maxResults)
}

// Placeholder for future ML-based recommendations
export async function getContentBasedRecommendations(
  extraction: CoffeeExtraction,
  limit: number = 6
): Promise<CoffeeRecommendation[]> {
  // TODO: Implement content-based filtering
  return []
}

export async function getCollaborativeRecommendations(
  userId?: string,
  limit: number = 6
): Promise<CoffeeRecommendation[]> {
  // TODO: Implement collaborative filtering
  return []
}