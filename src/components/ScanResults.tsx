// src/components/ScanResults.tsx - Enhanced version with reviews
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

  // Debug: Log the reviews data
  console.log('Reviews data in component:', reviewsData);
  console.log('Result reviews:', result.reviews);
  console.log('Product searched:', productSearched, 'Product found:', productFound);

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
    const level = roastLevel?.toLowerCase();
    if (level?.includes('light')) return 'roast-light';
    if (level?.includes('medium-dark')) return 'roast-medium-dark';
    if (level?.includes('medium')) return 'roast-medium';
    if (level?.includes('dark')) return 'roast-dark';
    return 'bg-gray-100 text-gray-800';
  };

  const handleFeedbackSubmit = (feedback: UserFeedback) => {
    if (onFeedback) {
      onFeedback(feedback);
    }
    setFeedbackSubmitted(true);
    setShowFeedback(false);
  };

  const fetchReviews = async () => {
    if (!extraction.roaster || !extraction.productName || 
        extraction.roaster === 'Could not parse response' || 
        extraction.productName === 'Could not parse response') {
      return;
    }

    setLoadingReviews(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roaster: extraction.roaster,
          productName: extraction.productName
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReviewsData(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Confidence Score */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-coffee-900 mb-2">
              Coffee Identified!
            </h2>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(confidence)}`}>
                {getConfidenceText(confidence)} ({Math.round(confidence * 100)}%)
              </div>
              <div className="text-sm text-coffee-600">
                {processingMethod === 'vision' ? 'AI Vision' : 'OCR'} • {processingTime}ms
              </div>
            </div>
          </div>
          <button
            onClick={onNewScan}
            className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
          >
            Scan Another
          </button>
        </div>

        {/* Coffee Information Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-coffee-600 uppercase tracking-wide mb-2">
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-coffee-600">Roaster:</span>
                  <p className="font-semibold text-coffee-900">{extraction.roaster || 'Not detected'}</p>
                </div>
                <div>
                  <span className="text-sm text-coffee-600">Coffee:</span>
                  <p className="font-semibold text-coffee-900">{extraction.productName || 'Not detected'}</p>
                </div>
                <div>
                  <span className="text-sm text-coffee-600">Origin:</span>
                  <p className="font-semibold text-coffee-900">{extraction.origin || 'Not detected'}</p>
                </div>
                <div>
                  <span className="text-sm text-coffee-600">Roast Level:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getRoastLevelClass(extraction.roastLevel)}`}>
                      {extraction.roastLevel || 'Not detected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-coffee-600 uppercase tracking-wide mb-2">
                Flavor Profile
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-coffee-600">Flavor Notes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {extraction.flavorNotes && extraction.flavorNotes.length > 0 ? (
                      extraction.flavorNotes.map((note, index) => (
                        <span key={index} className="flavor-tag">
                          {note}
                        </span>
                      ))
                    ) : (
                      <span className="text-coffee-500 text-sm">None detected</span>
                    )}
                  </div>
                </div>
                {extraction.processingMethod && (
                  <div>
                    <span className="text-sm text-coffee-600">Processing:</span>
                    <p className="font-semibold text-coffee-900">{extraction.processingMethod}</p>
                  </div>
                )}
                {extraction.varietal && extraction.varietal.length > 0 && (
                  <div>
                    <span className="text-sm text-coffee-600">Varietal:</span>
                    <p className="font-semibold text-coffee-900">{extraction.varietal.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section Status */}
        <div className="mt-6 pt-6 border-t border-coffee-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-medium text-coffee-600 uppercase tracking-wide">
                Product Reviews
              </h3>
              {productSearched && (
                <span className={`px-2 py-1 text-xs rounded ${
                  productFound ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {productFound ? 'Found' : 'Searched'}
                </span>
              )}
            </div>
            {!reviewsData && !loadingReviews && extraction.roaster && extraction.productName && 
             extraction.roaster !== 'Could not parse response' && extraction.productName !== 'Could not parse response' && (
              <button
                onClick={fetchReviews}
                className="px-3 py-1 text-sm bg-coffee-100 text-coffee-700 rounded hover:bg-coffee-200 transition-colors"
              >
                Find Reviews
              </button>
            )}
            {loadingReviews && (
              <div className="flex items-center space-x-2 text-sm text-coffee-600">
                <div className="coffee-loader"></div>
                <span>Searching for reviews...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {reviewsData && (
        <div className="space-y-6">
          <ReviewsSection 
            reviews={reviewsData} 
            roaster={extraction.roaster || 'Unknown Roaster'}
            productName={extraction.productName || 'Unknown Coffee'}
          />
        </div>
      )}

      {/* Debug info - remove this later */}
      {process.env.NODE_ENV === 'development' && (
        <div className="glass rounded-2xl p-4 bg-yellow-50 border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-2">Debug Info:</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <div>Has reviewsData: {reviewsData ? 'Yes' : 'No'}</div>
            <div>Product searched: {productSearched ? 'Yes' : 'No'}</div>
            <div>Product found: {productFound ? 'Yes' : 'No'}</div>
            <div>Reviews count: {reviewsData?.recentReviews?.length || 0}</div>
            <div>Average rating: {reviewsData?.averageRating || 'N/A'}</div>
          </div>
        </div>
      )}

      {/* Show loading or error states for reviews */}
      {loadingReviews && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="coffee-loader"></div>
            <span className="text-coffee-600">Searching for reviews...</span>
          </div>
        </div>
      )}

      {/* Show if no reviews found but search was attempted */}
      {!reviewsData && !loadingReviews && (productSearched && !productFound) && (
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
          {!showFeedback && !feedbackSubmitted && (
            <button
              onClick={() => setShowFeedback(true)}
              className="px-4 py-2 bg-coffee-100 text-coffee-700 rounded-lg hover:bg-coffee-200 transition-colors"
            >
              Provide Feedback
            </button>
          )}
        </div>

        {feedbackSubmitted && (
          <div className="flex items-center space-x-2 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Thank you for your feedback!</span>
          </div>
        )}

        {showFeedback && (
          <FeedbackForm
            scanId={result.id}
            onSubmit={handleFeedbackSubmit}
            onCancel={() => setShowFeedback(false)}
          />
        )}
      </div>
    </div>
  );
}

// Feedback Form Component
function FeedbackForm({ 
  scanId, 
  onSubmit, 
  onCancel 
}: { 
  scanId: string;
  onSubmit: (feedback: UserFeedback) => void;
  onCancel: () => void;
}) {
  const [accuracy, setAccuracy] = useState(5);
  const [comments, setComments] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      scanId,
      extractionAccuracy: accuracy,
      comments
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-coffee-700 mb-2">
          How accurate was the extraction? (1-5 stars)
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setAccuracy(star)}
              className={`w-8 h-8 ${
                star <= accuracy ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
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
          Additional comments (optional)
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
          placeholder="Any corrections or additional feedback..."
        />
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
        >
          Submit Feedback
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}