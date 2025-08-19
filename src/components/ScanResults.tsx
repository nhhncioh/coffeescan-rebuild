'use client'

import { useState } from 'react'
import { ScanResult, UserFeedback } from '@/types'
import CoffeeCard from './CoffeeCard'

interface ScanResultsProps {
  result: ScanResult
  onNewScan: () => void
  onFeedback?: (feedback: UserFeedback) => void
}

export default function ScanResults({ result, onNewScan, onFeedback }: ScanResultsProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const { extraction, confidence, processingMethod, processingTime, recommendations, roasterMatch } = result

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'Excellent'
    if (confidence >= 0.8) return 'Very Good'
    if (confidence >= 0.7) return 'Good'
    if (confidence >= 0.6) return 'Fair'
    return 'Low'
  }

  const getRoastLevelClass = (roastLevel?: string) => {
    const level = roastLevel?.toLowerCase()
    if (level?.includes('light')) return 'roast-light'
    if (level?.includes('medium-dark')) return 'roast-medium-dark'
    if (level?.includes('medium')) return 'roast-medium'
    if (level?.includes('dark')) return 'roast-dark'
    return 'bg-gray-100 text-gray-800'
  }

  const handleFeedbackSubmit = (feedback: UserFeedback) => {
    if (onFeedback) {
      onFeedback(feedback)
    }
    setFeedbackSubmitted(true)
    setShowFeedback(false)
  }

  return (
    <div className="space-y-8">
      {/* Header with Confidence Score */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-coffee-900 mb-2">
              Coffee Identified! ✨
            </h2>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(confidence)}`}>
                {Math.round(confidence * 100)}% confidence ({getConfidenceText(confidence)})
              </div>
              <div className="text-sm text-coffee-600">
                Processed in {processingTime}ms using {processingMethod}
              </div>
            </div>
          </div>
          
          <button
            onClick={onNewScan}
            className="px-4 py-2 bg-coffee-100 hover:bg-coffee-200 text-coffee-800 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>New Scan</span>
          </button>
        </div>

        {/* Extracted Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            {extraction.roaster && (
              <div>
                <h3 className="text-sm font-medium text-coffee-600 uppercase tracking-wider mb-2">
                  Roaster
                </h3>
                <div className="flex items-center space-x-3">
                  <p className="text-lg font-semibold text-coffee-900">
                    {extraction.roaster}
                  </p>
                  {roasterMatch?.verified && (
                    <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                {roasterMatch?.location && (
                  <p className="text-sm text-coffee-600">
                    📍 {roasterMatch.location}
                  </p>
                )}
              </div>
            )}

            {extraction.productName && (
              <div>
                <h3 className="text-sm font-medium text-coffee-600 uppercase tracking-wider mb-2">
                  Coffee Name
                </h3>
                <p className="text-lg font-medium text-coffee-900">
                  {extraction.productName}
                </p>
              </div>
            )}

            {extraction.origin && (
              <div>
                <h3 className="text-sm font-medium text-coffee-600 uppercase tracking-wider mb-2">
                  Origin
                </h3>
                <p className="text-lg text-coffee-900">
                  🌍 {extraction.origin}
                  {extraction.region && `, ${extraction.region}`}
                </p>
              </div>
            )}

            {extraction.roastLevel && (
              <div>
                <h3 className="text-sm font-medium text-coffee-600 uppercase tracking-wider mb-2">
                  Roast Level
                </h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoastLevelClass(extraction.roastLevel)}`}>
                  {extraction.roastLevel}
                </span>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-4">
            {extraction.processingMethod && (
              <div>
                <h3 className="text-sm font-medium text-coffee-600 uppercase tracking-wider mb-2">
                  Processing
                </h3>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {extraction.processingMethod}
                </span>
              </div>
            )}

            {extraction.varietal && extraction.varietal.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-coffee-600 uppercase tracking-wider mb-2">
                  Varietal
                </h3>
                <div className="flex flex-wrap gap-2">
                  {extraction.varietal.map((varietal, index) => (
                    <span key={index} className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                      {varietal}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {extraction.altitude && (
              <div>
                <h3 className="text-sm font-medium text-coffee-600 uppercase tracking-wider mb-2">
                  Altitude
                </h3>
                <p className="text-lg text-coffee-900">
                  ⛰️ {extraction.altitude.toLocaleString()}m
                </p>
              </div>
            )}

            {(extraction.price || extraction.weight) && (
              <div>
                <h3 className="text-sm font-medium text-coffee-600 uppercase tracking-wider mb-2">
                  Details
                </h3>
                <div className="space-y-1">
                  {extraction.price && (
                    <p className="text-coffee-900">💰 {extraction.price}</p>
                  )}
                  {extraction.weight && (
                    <p className="text-coffee-900">⚖️ {extraction.weight}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Flavor Notes */}
        {extraction.flavorNotes && extraction.flavorNotes.length > 0 && (
          <div className="mt-6 pt-6 border-t border-coffee-200">
            <h3 className="text-sm font-medium text-coffee-600 uppercase tracking-wider mb-3">
              Tasting Notes
            </h3>
            <div className="flex flex-wrap gap-2">
              {extraction.flavorNotes.map((note, index) => (
                <span key={index} className="flavor-tag">
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-coffee-900">
              Similar Coffees You Might Like
            </h3>
            <span className="text-sm text-coffee-600">
              {recommendations.length} recommendations
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <CoffeeCard 
                key={index}
                coffee={rec.coffee}
                similarity={rec.similarityScore}
                reason={rec.reason}
              />
            ))}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-coffee-900">
            How accurate was this scan?
          </h3>
          {!showFeedback && !feedbackSubmitted && (
            <button
              onClick={() => setShowFeedback(true)}
              className="px-4 py-2 bg-coffee-500 hover:bg-coffee-600 text-white rounded-lg transition-colors"
            >
              Provide Feedback
            </button>
          )}
        </div>

        {feedbackSubmitted && (
          <div className="flex items-center text-green-700 bg-green-50 p-3 rounded-lg">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Thank you for your feedback! This helps us improve our accuracy.</span>
          </div>
        )}

        {showFeedback && !feedbackSubmitted && (
          <FeedbackForm 
            scanId={result.id}
            onSubmit={handleFeedbackSubmit}
            onCancel={() => setShowFeedback(false)}
          />
        )}

        {!showFeedback && !feedbackSubmitted && (
          <p className="text-coffee-600 text-sm">
            Your feedback helps us improve our coffee identification accuracy. 
            Let us know if we got anything wrong or if you have suggestions!
          </p>
        )}
      </div>
    </div>
  )
}

// Feedback Form Component
interface FeedbackFormProps {
  scanId: string
  onSubmit: (feedback: UserFeedback) => void
  onCancel: () => void
}

function FeedbackForm({ scanId, onSubmit, onCancel }: FeedbackFormProps) {
  const [accuracy, setAccuracy] = useState<number>(5)
  const [recommendationQuality, setRecommendationQuality] = useState<number>(5)
  const [comments, setComments] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      scanId,
      extractionAccuracy: accuracy,
      recommendationQuality,
      comments: comments || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-coffee-700 mb-2">
          Extraction Accuracy (1-5 stars)
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setAccuracy(star)}
              className={`w-6 h-6 ${star <= accuracy ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-coffee-700 mb-2">
          Recommendation Quality (1-5 stars)
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRecommendationQuality(star)}
              className={`w-6 h-6 ${star <= recommendationQuality ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-coffee-700 mb-2">
          Additional Comments (Optional)
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Any corrections or suggestions?"
          className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 resize-none"
          rows={3}
        />
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          className="px-4 py-2 bg-coffee-500 hover:bg-coffee-600 text-white rounded-lg transition-colors"
        >
          Submit Feedback
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}