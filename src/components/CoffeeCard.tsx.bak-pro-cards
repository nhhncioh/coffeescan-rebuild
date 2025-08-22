'use client'

import { Coffee } from '@/types'

interface CoffeeCardProps {
  coffee: Coffee
  similarity?: number
  reason?: string
  showPrice?: boolean
  showActions?: boolean
  onClick?: () => void
}

export default function CoffeeCard({ 
  coffee, 
  similarity, 
  reason, 
  showPrice = true, 
  showActions = false,
  onClick 
}: CoffeeCardProps) {
  const getRoastLevelClass = (roastLevel?: string) => {
    const level = roastLevel?.toLowerCase()
    if (level?.includes('light')) return 'roast-light'
    if (level?.includes('medium-dark')) return 'roast-medium-dark'
    if (level?.includes('medium')) return 'roast-medium'
    if (level?.includes('dark')) return 'roast-dark'
    return 'bg-gray-100 text-gray-800'
  }

  const getSimilarityColor = (similarity?: number) => {
    if (!similarity) return 'bg-gray-100 text-gray-800'
    if (similarity >= 0.8) return 'bg-green-100 text-green-800'
    if (similarity >= 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div 
      className={`coffee-card p-4 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Coffee Image */}
      <div className="relative mb-4">
        {coffee.imageUrl ? (
          <img
            src={coffee.imageUrl}
            alt={coffee.name}
            className="w-full h-32 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-32 bg-coffee-100 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-coffee-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        
        {/* Similarity Badge */}
        {similarity && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getSimilarityColor(similarity)}`}>
            {Math.round(similarity * 100)}% match
          </div>
        )}

        {/* Featured Badge */}
        {coffee.featured && (
          <div className="absolute top-2 left-2 bg-coffee-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            ⭐ Featured
          </div>
        )}
      </div>

      {/* Coffee Info */}
      <div className="space-y-3">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-coffee-900 text-sm leading-tight mb-1">
            {coffee.name}
          </h3>
          <p className="text-coffee-600 text-xs">
            by {coffee.roaster?.name}
          </p>
          {coffee.roaster?.location && (
            <p className="text-coffee-500 text-xs">
              📍 {coffee.roaster.location}
            </p>
          )}
        </div>

        {/* Origin & Details */}
        {coffee.origin && (
          <div className="text-xs text-coffee-700">
            <span className="font-medium">Origin:</span> {coffee.origin}
            {coffee.region && `, ${coffee.region}`}
          </div>
        )}

        {/* Roast Level */}
        {coffee.roastLevel && (
          <div>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoastLevelClass(coffee.roastLevel)}`}>
              {coffee.roastLevel}
            </span>
          </div>
        )}

        {/* Processing Method */}
        {coffee.processingMethod && (
          <div>
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {coffee.processingMethod}
            </span>
          </div>
        )}

        {/* Flavor Notes */}
        {coffee.flavorNotes && coffee.flavorNotes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-coffee-600 mb-1">Tasting Notes:</p>
            <div className="flex flex-wrap gap-1">
              {coffee.flavorNotes.slice(0, 3).map((note, index) => (
                <span key={index} className="flavor-tag text-xs">
                  {note}
                </span>
              ))}
              {coffee.flavorNotes.length > 3 && (
                <span className="text-xs text-coffee-500">
                  +{coffee.flavorNotes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Varietal */}
        {coffee.varietal && coffee.varietal.length > 0 && (
          <div>
            <p className="text-xs font-medium text-coffee-600 mb-1">Varietal:</p>
            <div className="flex flex-wrap gap-1">
              {coffee.varietal.slice(0, 2).map((varietal, index) => (
                <span key={index} className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                  {varietal}
                </span>
              ))}
              {coffee.varietal.length > 2 && (
                <span className="text-xs text-coffee-500">
                  +{coffee.varietal.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Price & Weight */}
        {showPrice && (coffee.price || coffee.weightGrams) && (
          <div className="flex items-center justify-between text-xs text-coffee-600">
            {coffee.price && (
              <span className="font-medium">${coffee.price}</span>
            )}
            {coffee.weightGrams && (
              <span>{coffee.weightGrams}g</span>
            )}
          </div>
        )}

        {/* Similarity Reason */}
        {reason && (
          <div className="bg-coffee-50 p-2 rounded text-xs text-coffee-700">
            <p className="font-medium mb-1">Why this recommendation:</p>
            <p>{reason}</p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-2 border-t border-coffee-100">
            <button className="flex-1 px-3 py-2 bg-coffee-500 hover:bg-coffee-600 text-white text-xs rounded transition-colors">
              View Details
            </button>
            <button className="px-3 py-2 bg-coffee-100 hover:bg-coffee-200 text-coffee-800 text-xs rounded transition-colors">
              ❤️
            </button>
          </div>
        )}

        {/* Availability Status */}
        {!coffee.available && (
          <div className="text-center py-2 bg-gray-100 text-gray-600 text-xs rounded">
            Currently Unavailable
          </div>
        )}
      </div>
    </div>
  )
}