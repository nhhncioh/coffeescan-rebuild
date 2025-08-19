// src/components/ReviewsSection.tsx
'use client'

import { useState } from 'react'

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
  } | null;
}

interface ReviewsSectionProps {
  reviews: ReviewSummary | null | undefined;
  roaster: string;
  productName: string;
}

export default function ReviewsSection({ reviews, roaster, productName }: ReviewsSectionProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Multiple layers of null safety
  if (!reviews || typeof reviews !== 'object') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews available</p>
        </div>
      </div>
    );
  }

  // Extremely safe property access
  let productPageUrl = null;
  let productPageSource = null;
  let productPagePrice = null;

  try {
    if (reviews && reviews.productPage && typeof reviews.productPage === 'object') {
      productPageUrl = reviews.productPage.url || null;
      productPageSource = reviews.productPage.source || null;
      productPagePrice = reviews.productPage.price || null;
    }
  } catch (e) {
    // Swallow any errors and use null values
    console.warn('Error accessing productPage properties:', e);
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starClass = size === 'sm' ? 'text-base' : 'text-xl';
    const fullStars = Math.floor(rating || 0);
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star}
            className={`${starClass} leading-none ${
              star <= fullStars ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm font-medium">
          {(rating || 0).toFixed(1)}
        </span>
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const distribution = reviews.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const totalReviews = reviews.totalReviews || 0;

    return (
      <div className="flex flex-col gap-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution[rating as keyof typeof distribution] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-8">
                {rating}★
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const getSourceBadge = (source: string) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    switch (source) {
      case 'website':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'amazon':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'third-party':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRatingDescription = (rating: number) => {
    const safeRating = rating || 0;
    if (safeRating >= 4.5) return 'Excellent';
    if (safeRating >= 4.0) return 'Very Good';
    if (safeRating >= 3.5) return 'Good';
    if (safeRating >= 3.0) return 'Average';
    return 'Below Average';
  };

  const recentReviews = reviews.recentReviews || [];
  const averageRating = reviews.averageRating || 0;
  const totalReviews = reviews.totalReviews || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
        {productPageUrl && (
          <a
            href={productPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            View Product Page ↗
          </a>
        )}
      </div>

      {/* Rating Summary */}
      <div className="mb-6 p-6 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2 text-gray-900">
              {averageRating.toFixed(1)}
            </div>
            {renderStars(averageRating, 'md')}
            <div className="mt-2 text-sm text-gray-600">
              {getRatingDescription(averageRating)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2 text-gray-900">
              {totalReviews}
            </div>
            <div className="text-sm text-gray-600">
              Total Reviews
            </div>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Rating Breakdown</h4>
        {renderRatingDistribution()}
      </div>

      {/* Recent Reviews */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Recent Reviews</h4>
        <div className="flex flex-col gap-6">
          {recentReviews
            .slice(0, showAllReviews ? recentReviews.length : 3)
            .map((review) => (
              <div key={review.id} className="pb-6 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className="font-medium text-gray-900">{review.author}</span>
                      {review.verified && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          Verified Purchase
                        </span>
                      )}
                      <span className={getSourceBadge(review.source)}>
                        {review.source}
                      </span>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-500 ml-4 flex-shrink-0">
                    {formatDate(review.date)}
                  </span>
                </div>
                
                {review.title && (
                  <h5 className="font-medium mb-2 text-gray-900">{review.title}</h5>
                )}
                
                <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                
                {review.helpful && review.helpful > 0 && (
                  <div className="text-sm text-gray-500">
                    {review.helpful} people found this helpful
                  </div>
                )}
              </div>
            ))}
        </div>
        
        {recentReviews.length > 3 && (
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            {showAllReviews ? 'Show Less' : `Show All ${recentReviews.length} Reviews`}
          </button>
        )}
      </div>

      {/* Footer */}
      {productPageUrl && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Reviews from {productPageSource || 'website'}</span>
            {productPagePrice && (
              <span className="font-medium text-gray-900">{productPagePrice}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}