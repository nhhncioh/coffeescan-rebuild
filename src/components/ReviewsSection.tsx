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

  if (!reviews || typeof reviews !== 'object') {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280' }}>No reviews available</p>
      </div>
    );
  }

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
    console.warn('Error accessing productPage properties:', e);
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? '16px' : '20px';
    const fullStars = Math.floor(rating || 0);
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
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
        <span style={{ 
          marginLeft: '8px', 
          fontSize: '14px', 
          fontWeight: '500',
          color: '#374151'
        }}>
          {(rating || 0).toFixed(1)}
        </span>
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const distribution = reviews.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const totalReviews = reviews.totalReviews || 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = distribution[rating as keyof typeof distribution] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={rating} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '14px'
            }}>
              <span style={{ 
                fontWeight: '500', 
                color: '#374151', 
                width: '24px',
                textAlign: 'right'
              }}>
                {rating}★
              </span>
              <div style={{ 
                flex: '1', 
                backgroundColor: '#e5e7eb', 
                borderRadius: '9999px', 
                height: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  backgroundColor: '#fbbf24', 
                  height: '8px', 
                  borderRadius: '9999px',
                  width: `${percentage}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span style={{ 
                color: '#6b7280', 
                width: '32px',
                textAlign: 'right'
              }}>
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
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    };
    
    switch (source) {
      case 'website':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'amazon':
        return { ...baseStyle, backgroundColor: '#fed7aa', color: '#ea580c' };
      case 'third-party':
        return { ...baseStyle, backgroundColor: '#e9d5ff', color: '#7c3aed' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
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
    <div style={{ 
      backgroundColor: 'white', 
      border: '1px solid #e5e7eb', 
      borderRadius: '12px', 
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#111827',
          margin: '0'
        }}>
          Customer Reviews
        </h3>
        {productPageUrl && (
          <a
            href={productPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              fontSize: '14px', 
              color: '#2563eb', 
              textDecoration: 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.color = '#2563eb'}
          >
            View Product Page ↗
          </a>
        )}
      </div>

      {/* Rating Summary */}
      <div style={{ 
        marginBottom: '24px', 
        padding: '20px', 
        backgroundColor: '#f9fafb', 
        borderRadius: '8px' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              marginBottom: '8px', 
              color: '#111827' 
            }}>
              {averageRating.toFixed(1)}
            </div>
            {renderStars(averageRating, 'md')}
            <div style={{ 
              marginTop: '4px', 
              fontSize: '14px', 
              color: '#6b7280' 
            }}>
              {getRatingDescription(averageRating)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              marginBottom: '8px', 
              color: '#111827' 
            }}>
              {totalReviews}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#6b7280' 
            }}>
              Total Reviews
            </div>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ 
          fontWeight: '500', 
          color: '#111827', 
          marginBottom: '12px',
          fontSize: '16px',
          margin: '0 0 12px 0'
        }}>
          Rating Breakdown
        </h4>
        {renderRatingDistribution()}
      </div>

      {/* Recent Reviews */}
      <div>
        <h4 style={{ 
          fontWeight: '500', 
          color: '#111827', 
          marginBottom: '16px',
          fontSize: '16px',
          margin: '0 0 16px 0'
        }}>
          Recent Reviews
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {recentReviews
            .slice(0, showAllReviews ? recentReviews.length : 3)
            .map((review, index) => (
              <div key={review.id} style={{ 
                paddingBottom: index < recentReviews.slice(0, showAllReviews ? recentReviews.length : 3).length - 1 ? '20px' : '0',
                borderBottom: index < recentReviews.slice(0, showAllReviews ? recentReviews.length : 3).length - 1 ? '1px solid #e5e7eb' : 'none'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  marginBottom: '8px' 
                }}>
                  <div style={{ flex: '1' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      flexWrap: 'wrap', 
                      gap: '8px', 
                      marginBottom: '4px' 
                    }}>
                      <span style={{ 
                        fontWeight: '500', 
                        color: '#111827',
                        fontSize: '14px'
                      }}>
                        {review.author}
                      </span>
                      {review.verified && (
                        <span style={{ 
                          backgroundColor: '#dcfce7', 
                          color: '#166534', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          Verified
                        </span>
                      )}
                      <span style={getSourceBadge(review.source)}>
                        {review.source}
                      </span>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginLeft: '16px'
                  }}>
                    {formatDate(review.date)}
                  </span>
                </div>
                
                {review.title && (
                  <h5 style={{ 
                    fontWeight: '500', 
                    marginBottom: '4px', 
                    color: '#111827',
                    fontSize: '14px',
                    margin: '0 0 4px 0'
                  }}>
                    {review.title}
                  </h5>
                )}
                
                <p style={{ 
                  color: '#374151', 
                  fontSize: '14px', 
                  lineHeight: '1.5', 
                  marginBottom: '8px',
                  margin: '0 0 8px 0'
                }}>
                  {review.comment}
                </p>
                
                {review.helpful && review.helpful > 0 && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280' 
                  }}>
                    {review.helpful} people found this helpful
                  </div>
                )}
              </div>
            ))}
        </div>
        
        {recentReviews.length > 3 && (
          <button
            onClick={() => setShowAllReviews(!showAllReviews)}
            style={{ 
              marginTop: '12px', 
              color: '#2563eb', 
              fontWeight: '500', 
              fontSize: '14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#1d4ed8'}
            onMouseOut={(e) => e.currentTarget.style.color = '#2563eb'}
          >
            {showAllReviews ? 'Show Less' : `Show All ${recentReviews.length} Reviews`}
          </button>
        )}
      </div>

      {/* Footer */}
      {productPageUrl && (
        <div style={{ 
          marginTop: '32px', 
          paddingTop: '24px', 
          borderTop: '1px solid #e5e7eb' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '14px', 
            color: '#6b7280' 
          }}>
            <span>Reviews from {productPageSource || 'website'}</span>
            {productPagePrice && (
              <span style={{ 
                fontWeight: '500', 
                color: '#111827' 
              }}>
                {productPagePrice}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}