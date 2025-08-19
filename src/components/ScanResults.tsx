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
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Coffee Identified!</h2>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(confidence)}`}>
              {getConfidenceText(confidence)} ({Math.round(confidence * 100)}%)
            </span>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {processingMethod === 'vision' ? 'AI Vision' : processingMethod} • {(processingTime / 1000).toFixed(1)}s
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Coffee Details
              </h3>
              <div className="space-y-3">
                {extraction.roaster && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Roaster:</span>
                    <span className="font-semibold text-gray-900 text-right">{extraction.roaster}</span>
                  </div>
                )}
                {extraction.roasterCountry && extraction.roasterCountry !== 'Unable to extract' && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Roaster Country:</span>
                    <span className="font-semibold text-gray-900 text-right">{extraction.roasterCountry}</span>
                  </div>
                )}
                {extraction.productName && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Coffee:</span>
                    <span className="font-semibold text-gray-900 text-right">{extraction.productName}</span>
                  </div>
                )}
                {extraction.roastLevel && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Roast Level:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoastLevelClass(extraction.roastLevel)}`}>
                      {extraction.roastLevel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Origin & Processing */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Origin & Processing
              </h3>
              <div className="space-y-3">
                {extraction.origin && extraction.origin !== 'Unable to extract' && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Bean Origin:</span>
                    <span className="font-semibold text-gray-900 text-right">{extraction.origin}</span>
                  </div>
                )}
                {extraction.region && extraction.region !== 'Unable to extract' && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Region:</span>
                    <span className="font-semibold text-gray-900 text-right">{extraction.region}</span>
                  </div>
                )}
                {extraction.processingMethod && extraction.processingMethod !== 'Unable to extract' && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Processing:</span>
                    <span className="font-semibold text-gray-900 text-right">{extraction.processingMethod}</span>
                  </div>
                )}
                {extraction.altitude && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Altitude:</span>
                    <span className="font-semibold text-gray-900 text-right">{extraction.altitude}m</span>
                  </div>
                )}
                {extraction.harvestYear && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Harvest Year:</span>
                    <span className="font-semibold text-gray-900 text-right">{extraction.harvestYear}</span>
                  </div>
                )}
                {extraction.varietal && extraction.varietal.length > 0 && (
                  <div className="py-2">
                    <span className="text-gray-600 font-medium block mb-2">Varietal:</span>
                    <div className="flex flex-wrap gap-1">
                      {extraction.varietal.map((variety, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                        >
                          {variety}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {extraction.certifications && extraction.certifications.length > 0 && (
                  <div className="py-2">
                    <span className="text-gray-600 font-medium block mb-2">Certifications:</span>
                    <div className="flex flex-wrap gap-1">
                      {extraction.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Flavor & Brewing */}
          <div className="space-y-6">
            {extraction.flavorNotes && extraction.flavorNotes.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                  Flavor Profile
                </h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {extraction.flavorNotes.map((note, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 rounded-lg text-sm font-medium border border-amber-200"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {extraction.brewRecommendations && extraction.brewRecommendations.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Brewing Methods
                </h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {extraction.brewRecommendations.map((method, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium border border-purple-200"
                    >
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {extraction.grindRecommendation && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Recommended Grind:</span>
                  <span className="font-semibold text-gray-900 text-right">{extraction.grindRecommendation}</span>
                </div>
              )}
              {extraction.weight && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Package Size:</span>
                  <span className="font-semibold text-gray-900 text-right">{extraction.weight}</span>
                </div>
              )}
              {extraction.price && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Price:</span>
                  <span className="font-semibold text-green-600 text-right text-lg">{extraction.price}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Processing Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-gray-600">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${productSearched ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                Reviews searched: {productSearched ? 'Yes' : 'No'}
              </span>
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${productFound ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                Product found: {productFound ? 'Yes' : 'No'}
              </span>
            </div>
            <span className="text-gray-500">
              Processed using {processingMethod} analysis
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {loadingReviews && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 font-medium">Searching for reviews...</span>
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
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.87 0-5.431.58-7.543 1.606C3.373 16.97 3 17.531 3 18.109V19a1 1 0 001 1h16a1 1 0 001-1v-.891c0-.578-.373-1.139-1.457-1.493A7.962 7.962 0 0112 15z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Found</h3>
          <p className="text-gray-600">
            We searched for reviews but couldn't find any for this specific coffee.
          </p>
        </div>
      )}

      {/* Feedback Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            How accurate was this scan?
          </h3>
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
          >
            {showFeedback ? 'Hide Feedback' : 'Give Feedback'}
          </button>
        </div>

        {showFeedback && !feedbackSubmitted && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleFeedbackSubmit({ extractionAccuracy: 5 })}
                className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors text-center group"
              >
                <div className="text-green-600 text-2xl mb-2 group-hover:scale-110 transition-transform">👍</div>
                <div className="text-sm font-medium text-green-700">Very Accurate</div>
                <div className="text-xs text-green-600 mt-1">Everything looks correct</div>
              </button>
              <button
                onClick={() => handleFeedbackSubmit({ extractionAccuracy: 2 })}
                className="p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-center group"
              >
                <div className="text-red-600 text-2xl mb-2 group-hover:scale-110 transition-transform">👎</div>
                <div className="text-sm font-medium text-red-700">Needs Work</div>
                <div className="text-xs text-red-600 mt-1">Some details are wrong</div>
              </button>
            </div>
          </div>
        )}

        {feedbackSubmitted && (
          <div className="text-center py-6">
            <div className="text-green-600 text-3xl mb-3">✓</div>
            <p className="text-gray-600 font-medium">Thank you for your feedback!</p>
            <p className="text-sm text-gray-500 mt-1">This helps us improve our AI recognition</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onNewScan}
          className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
        >
          Scan Another Coffee
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Save Results
        </button>
      </div>
    </div>
  );
}