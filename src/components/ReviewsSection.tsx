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

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? '16px' : '20px';
    const fullStars = Math.floor(rating);
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star}
            style={{ 
              color: star <= fullStars ? '#fbbf24' : '#d1d5db',
              fontSize: starSize,
              lineHeight: '1'
            }}
          >
            ★
          </span>
        ))}
        <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '500' }}>
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const renderRatingDistribution = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = reviews.ratingDistribution[rating as keyof typeof reviews.ratingDistribution];
          const percentage = reviews.totalReviews > 0 ? (count / reviews.totalReviews) * 100 : 0;
          
          return (
            <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span style={{ width: '12px', textAlign: 'right' }}>{rating}</span>
              <span style={{ color: '#fbbf24', width: '16px' }}>★</span>
              <div style={{ flex: 1, height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', minWidth: '100px' }}>
                <div
                  style={{ 
                    width: `${Math.max(percentage, 2)}%`, 
                    height: '100%', 
                    backgroundColor: '#fbbf24', 
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <span style={{ width: '32px', textAlign: 'right', color: '#6b7280' }}>{count}</span>
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
      website: { background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' },
      amazon: { background: '#fed7aa', color: '#9a3412', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' },
      'third-party': { background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }
    };
    
    return badges[source as keyof typeof badges] || badges['third-party'];
  };

  if (!reviews) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews</h3>
        <p className="text-gray-500">No reviews available</p>
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
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View Product Page ↗
          </a>
        )}
      </div>

      {/* Rating Summary */}
      <div className="mb-6 p-6 bg-gray-50 rounded-lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
              {reviews.averageRating.toFixed(1)}
            </div>
            {renderStars(reviews.averageRating, 'md')}
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
              {reviews.averageRating >= 4.5 ? 'Excellent' : 
               reviews.averageRating >= 4.0 ? 'Very Good' :
               reviews.averageRating >= 3.5 ? 'Good' :
               reviews.averageRating >= 3.0 ? 'Average' : 'Below Average'}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              {reviews.totalReviews}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {reviews.recentReviews
            .slice(0, showAllReviews ? reviews.recentReviews.length : 3)
            .map((review) => (
              <div key={review.id} style={{ paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '500', color: '#111827' }}>{review.author}</span>
                      {review.verified && (
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                          Verified Purchase
                        </span>
                      )}
                      <span style={getSourceBadge(review.source)}>
                        {review.source}
                      </span>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '16px', flexShrink: 0 }}>
                    {formatDate(review.date)}
                  </span>
                </div>
                
                {review.title && (
                  <h5 style={{ fontWeight: '500', marginBottom: '8px' }}>{review.title}</h5>
                )}
                
                <p style={{ color: '#374151', lineHeight: '1.5' }}>{review.comment}</p>
                
                {review.helpful && review.helpful > 0 && (
                  <div style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
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

      {/* Footer */}
      {reviews.productPage && (
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280' }}>
            <span>Reviews from {reviews.productPage.source}</span>
            {reviews.productPage.price && (
              <span style={{ fontWeight: '500', color: '#111827' }}>{reviews.productPage.price}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}