// src/components/ScanResults.tsx
'use client'

import { useState } from 'react'
import ReviewsSection from './ReviewsSection'

interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title?: string;
  comment: string;
  date: string;
  verified?: boolean;
  helpful?: number;
  source: 'website' | 'amazon' | 'third-party';
}

interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: ProductReview[];
  productPage?: {
    url: string;
    title: string;
    description?: string;
    price?: string;
    availability?: string;
    source: string;
  };
}

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

interface EnhancedScanResult {
  id: string;
  extraction: CoffeeExtraction;
  confidence: number;
  processingMethod: 'vision' | 'ocr' | 'hybrid';
  processingTime: number;
  imageUrl?: string;
  productSearched?: boolean;
  productFound?: boolean;
  reviews?: ReviewSummary;
}

interface UserFeedback {
  scanId: string;
  extractionAccuracy?: number;
  recommendationQuality?: number;
  corrections?: Partial<CoffeeExtraction>;
  comments?: string;
}

interface ScanResultsProps {
  result: EnhancedScanResult;
  onNewScan: () => void;
  onFeedback?: (feedback: UserFeedback) => void;
}

export default function ScanResults({ result, onNewScan, onFeedback }: ScanResultsProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewsData, setReviewsData] = useState<ReviewSummary | null>(result.reviews || null);

  const { extraction, confidence, processingMethod, processingTime, productSearched, productFound } = result;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'Excellent';
    if (confidence >= 0.8) return 'Very Good';
    if (confidence >= 0.7) return 'Good';
    if (confidence >= 0.6) return 'Fair';
    return 'Low';
  };

  const getRoastLevelClass = (roastLevel?: string) => {
    if (!roastLevel) return 'bg-gray-100 text-gray-800';
    
    const level = roastLevel.toLowerCase();
    if (level.includes('light')) return 'bg-yellow-100 text-yellow-800';
    if (level.includes('medium')) return 'bg-orange-100 text-orange-800';
    if (level.includes('dark')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleFeedbackSubmit = (feedback: Partial<UserFeedback>) => {
    if (onFeedback) {
      onFeedback({
        scanId: result.id,
        ...feedback
      });
    }
    setFeedbackSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Extraction Results */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-coffee-900">Scan Results</h2>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(confidence)}`}>
              {getConfidenceText(confidence)} Match
            </span>
            <span className="text-sm text-coffee-600">
              {(processingTime / 1000).toFixed(1)}s
            </span>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            {extraction.flavorNotes && extraction.flavorNotes.length > 0 && (
              <div>
                <h4 className="font-medium text-coffee-900 mb-2">Flavor Notes</h4>
                <div className="flex flex-wrap gap-2">
                  {extraction.flavorNotes.map((note, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-coffee-100 text-coffee-800 rounded-full text-sm"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {extraction.processingMethod && (
              <div className="flex justify-between">
                <span className="text-coffee-600">Processing:</span>
                <span className="font-medium text-coffee-900">{extraction.processingMethod}</span>
              </div>
            )}

            {extraction.altitude && (
              <div className="flex justify-between">
                <span className="text-coffee-600">Altitude:</span>
                <span className="font-medium text-coffee-900">{extraction.altitude}m</span>
              </div>
            )}

            {extraction.price && (
              <div className="flex justify-between">
                <span className="text-coffee-600">Price:</span>
                <span className="font-medium text-coffee-900">{extraction.price}</span>
              </div>
            )}
          </div>
        </div>

        {/* Processing Info */}
        <div className="mt-6 pt-6 border-t border-coffee-200">
          <div className="flex items-center justify-between text-sm text-coffee-600">
            <span>Processed using {processingMethod} analysis</span>
            <div className="flex items-center gap-4">
              <span>Reviews searched: {productSearched ? 'Yes' : 'No'}</span>
              <span>Product found: {productFound ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {loadingReviews && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="coffee-loader"></div>
            <span className="text-coffee-600">Searching for reviews...</span>
          </div>
        </div>
      )}

      {reviewsData && (
        <ReviewsSection 
          reviews={reviewsData} 
          roaster={extraction.roaster || ''} 
          productName={extraction.productName || ''} 
        />
      )}

      {!reviewsData && !loadingReviews && productSearched && !productFound && (
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-coffee-600 mb-2">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.87 0-5.431.58-7.543 1.606C3.373 16.97 3 17.531 3 18.109V19a1 1 0 001 1h16a1 1 0 001-1v-.891c0-.578-.373-1.139-1.457-1.493A7.962 7.962 0 0112 15z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-coffee-900 mb-2">No Reviews Found</h3>
          <p className="text-coffee-600">
            We searched for reviews but couldn't find any for this specific coffee.
          </p>
        </div>
      )}

      {/* Feedback Section */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-coffee-900">
            How accurate was this scan?
          </h3>
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="text-coffee-600 hover:text-coffee-800 transition-colors"
          >
            {showFeedback ? 'Hide' : 'Give Feedback'}
          </button>
        </div>

        {showFeedback && !feedbackSubmitted && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleFeedbackSubmit({ extractionAccuracy: 5 })}
                className="p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors text-center"
              >
                <div className="text-green-600 text-xl mb-1">👍</div>
                <div className="text-sm font-medium">Very Accurate</div>
              </button>
              <button
                onClick={() => handleFeedbackSubmit({ extractionAccuracy: 2 })}
                className="p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-center"
              >
                <div className="text-red-600 text-xl mb-1">👎</div>
                <div className="text-sm font-medium">Needs Work</div>
              </button>
            </div>
          </div>
        )}

        {feedbackSubmitted && (
          <div className="text-center py-4">
            <div className="text-green-600 text-xl mb-2">✓</div>
            <p className="text-coffee-600">Thank you for your feedback!</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onNewScan}
          className="flex-1 bg-coffee-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-coffee-700 transition-colors"
        >
          Scan Another Coffee
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 border border-coffee-300 text-coffee-700 rounded-xl font-medium hover:bg-coffee-50 transition-colors"
        >
          Save Results
        </button>
      </div>
    </div>
  );
}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-coffee-900 mb-3">Coffee Details</h3>
              <div className="space-y-3">
                {extraction.roaster && (
                  <div className="flex justify-between">
                    <span className="text-coffee-600">Roaster:</span>
                    <span className="font-medium text-coffee-900">{extraction.roaster}</span>
                  </div>
                )}
                {extraction.productName && (
                  <div className="flex justify-between">
                    <span className="text-coffee-600">Product:</span>
                    <span className="font-medium text-coffee-900">{extraction.productName}</span>
                  </div>
                )}
                {extraction.origin && (
                  <div className="flex justify-between">
                    <span className="text-coffee-600">Origin:</span>
                    <span className="font-medium text-coffee-900">{extraction.origin}</span>
                  </div>
                )}
                {extraction.roastLevel && (
                  <div className="flex justify-between items-center">
                    <span className="text-coffee-600">Roast Level:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoastLevelClass(extraction.roastLevel)}`}>
                      {extraction.roastLevel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>