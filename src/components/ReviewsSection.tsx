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
  };
}

interface ReviewsSectionProps {
  reviews: ReviewSummary;
  roaster: string;
  productName: string;
}

export default function ReviewsSection({ reviews, roaster, productName }: ReviewsSectionProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Debug logging
  console.log('ReviewsSection received:', { 
    reviews, 
    roaster, 
    productName,
    hasReviews: !!reviews,
    reviewCount: reviews?.recentReviews?.length,
    averageRating: reviews?.averageRating,
    totalReviews: reviews?.totalReviews
  });

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 16 : 20;
    const fullStars = Math.floor(rating);
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= fullStars;
          
          return (
            <div
              key={star}
              className="flex-shrink-0"
              style={{
                width: starSize + 'px',
                height: starSize + 'px',
              }}
            >
              <svg
                width={starSize}
                height={starSize}
                viewBox="0 0 20 20"
                fill="currentColor"
                className={isFilled ? 'text-yellow-400' : 'text-gray-300'}
                style={{
                  width: starSize + 'px',
                  height: starSize + 'px',
                }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          );
        })}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const maxCount = Math.max(...Object.values(reviews.ratingDistribution));
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = reviews.ratingDistribution[rating as keyof typeof reviews.ratingDistribution];
          const percentage = reviews.totalReviews > 0 ? (count / reviews.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center text-sm">
              <span className="w-3 text-gray-600">{rating}</span>
              <div className="w-4 h-4 mx-1 text-yellow-400">★</div>
              <div className="flex-1 mx-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getSourceBadge = (source: string) => {
    const badges = {
      website: 'bg-green-100 text-green-800',
      amazon: 'bg-orange-100 text-orange-800',
      'third-party': 'bg-gray-100 text-gray-800'
    };
    
    return badges[source as keyof typeof badges] || badges['third-party'];
  };

  // Early return if no reviews
  if (!reviews) {
    console.log('No reviews data provided to ReviewsSection');
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h3>
        <p className="text-gray-500">No reviews available</p>
      </div>
    );
  }

  // Validate reviews data structure
  if (!reviews.recentReviews || !Array.isArray(reviews.recentReviews)) {
    console.error('Invalid reviews data structure:', reviews);
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h3>
        <p className="text-red-500">Error loading reviews data</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
        {reviews.productPage && (
          <a
            href={reviews.productPage.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            View Product Page
            <span className="ml-1 text-xs">↗</span>
          </a>
        )}
      </div>

      {/* Show basic stats */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {reviews.averageRating ? reviews.averageRating.toFixed(1) : 'N/A'}
            </div>
            {reviews.averageRating && renderStars(reviews.averageRating, 'md')}
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {reviews.totalReviews || 0} Reviews
            </div>
            <div className="text-sm text-gray-600">
              {reviews.averageRating >= 4.5 ? 'Excellent' : 
               reviews.averageRating >= 4.0 ? 'Very Good' :
               reviews.averageRating >= 3.5 ? 'Good' :
               reviews.averageRating >= 3.0 ? 'Average' : 'Below Average'}
            </div>
          </div>
        </div>
      </div>

      {/* Rating distribution */}
      {reviews.ratingDistribution && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Rating Breakdown</h4>
          {renderRatingDistribution()}
        </div>
      )}

      {/* Recent Reviews */}
      {reviews.recentReviews && reviews.recentReviews.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Recent Reviews</h4>
          <div className="space-y-6">
            {reviews.recentReviews
              .slice(0, showAllReviews ? reviews.recentReviews.length : 3)
              .map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-gray-900">{review.author}</span>
                        {review.verified && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Verified Purchase
                          </span>
                        )}
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${getSourceBadge(review.source)}`}>
                          {review.source}
                        </span>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                  </div>
                  
                  {review.title && (
                    <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                  )}
                  
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  
                  {review.helpful && review.helpful > 0 && (
                    <div className="mt-3 text-sm text-gray-500">
                      {review.helpful} people found this helpful
                    </div>
                  )}
                </div>
              ))}
          </div>
          
          {reviews.recentReviews.length > 3 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              {showAllReviews ? 'Show Less' : `Show All ${reviews.recentReviews.length} Reviews`}
            </button>
          )}
        </div>
      )}

      {/* Product Info Footer */}
      {reviews.productPage && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
            <span>Reviews from {reviews.productPage.source}</span>
            {reviews.productPage.price && (
              <span className="font-medium text-gray-900">{reviews.productPage.price}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}