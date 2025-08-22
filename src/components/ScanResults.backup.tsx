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
  roasterCountry?: string;
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
  grindRecommendation?: string;
  certifications?: string[];
  additionalNotes?: string;
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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Coffee Identified!</h1>
        <div className="flex items-center justify-center gap-4">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getConfidenceColor(confidence)}`}>
            {getConfidenceText(confidence)} ({Math.round(confidence * 100)}%)
          </span>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {processingMethod === 'vision' ? 'AI Vision' : processingMethod} • {(processingTime / 1000).toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Coffee Information Grid */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
        
        {/* Coffee Details Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-blue-900">Coffee Details</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">ROASTER</div>
              <div className="text-lg font-bold text-blue-900">{extraction.roaster || 'Not detected'}</div>
            </div>
            
            {extraction.roasterCountry && extraction.roasterCountry !== 'Unable to extract' && (
              <div>
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">ROASTER COUNTRY</div>
                <div className="text-lg font-bold text-blue-900">{extraction.roasterCountry}</div>
              </div>
            )}
            
            <div>
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">COFFEE NAME</div>
              <div className="text-lg font-bold text-blue-900">{extraction.productName || 'Not detected'}</div>
            </div>
            
            {extraction.roastLevel && (
              <div>
                <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">ROAST LEVEL</div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getRoastLevelClass(extraction.roastLevel)}`}>
                  {extraction.roastLevel}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Origin & Processing Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-900">Origin & Processing</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">BEAN ORIGIN</div>
              <div className="text-lg font-bold text-green-900">
                {(extraction.origin && extraction.origin !== 'Unable to extract' && extraction.origin !== 'Not specified') 
                  ? extraction.origin 
                  : <span className="text-green-600 italic font-medium">Not specified on packaging</span>
                }
              </div>
            </div>
            
            <div>
              <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">REGION</div>
              <div className="text-lg font-bold text-green-900">
                {(extraction.region && extraction.region !== 'Unable to extract' && extraction.region !== 'Not specified') 
                  ? extraction.region 
                  : <span className="text-green-600 italic font-medium">Not specified on packaging</span>
                }
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">PROCESSING METHOD</div>
              <div className="text-lg font-bold text-green-900">
                {(extraction.processingMethod && extraction.processingMethod !== 'Unable to extract' && extraction.processingMethod !== 'Not specified') 
                  ? extraction.processingMethod 
                  : <span className="text-green-600 italic font-medium">Not specified on packaging</span>
                }
              </div>
            </div>

            {extraction.certifications && extraction.certifications.length > 0 && (
              <div>
                <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">CERTIFICATIONS</div>
                <div className="flex flex-wrap gap-2">
                  {extraction.certifications.map((cert, index) => (
                    <span key={index} className="px-3 py-1 bg-green-200 text-green-800 rounded-lg text-sm font-bold">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Flavor & Brewing Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-amber-900">Flavor & Brewing</h2>
          </div>
          
          <div className="space-y-4">
            {extraction.flavorNotes && extraction.flavorNotes.length > 0 && (
              <div>
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">FLAVOR NOTES</div>
                <div className="flex flex-wrap gap-2">
                  {extraction.flavorNotes.map((note, index) => (
                    <span key={index} className="px-3 py-1 bg-amber-200 text-amber-900 rounded-lg text-sm font-bold border-2 border-amber-300">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">BREWING METHODS</div>
              <div className="text-lg font-bold text-amber-900">
                {extraction.brewRecommendations && extraction.brewRecommendations.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {extraction.brewRecommendations.map((method, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-200 text-purple-900 rounded-lg text-sm font-bold border-2 border-purple-300">
                        {method}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-amber-600 italic font-medium">Not specified on packaging</span>
                )}
              </div>
            </div>

            {extraction.weight && (
              <div>
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">PACKAGE SIZE</div>
                <div className="text-lg font-bold text-amber-900">{extraction.weight}</div>
              </div>
            )}
            
            {extraction.price && extraction.price !== 'Not visible' && (
              <div>
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">PRICE</div>
                <div className="text-2xl font-bold text-green-600">{extraction.price}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6 text-gray-600">
            <span className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${productSearched ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              Reviews searched: {productSearched ? 'Yes' : 'No'}
            </span>
            <span className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${productFound ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              Product found: {productFound ? 'Yes' : 'No'}
            </span>
          </div>
          <span className="text-gray-500 font-medium">
            Processed using {processingMethod} analysis
          </span>
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
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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