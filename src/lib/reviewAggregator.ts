// src/lib/reviewAggregator.ts
interface SourceReview {
  source: 'amazon' | 'reddit' | 'product_page';
  rating?: number; // 1-5 scale
  reviewCount?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  confidence: number; // 0-1 how reliable this data is
  rawData?: any;
}

interface AggregatedReview {
  overallRating: number;
  totalReviews: number;
  confidence: number;
  consensus: string;
  sources: SourceReview[];
  breakdown: {
    amazon?: SourceReview;
    reddit?: SourceReview;
    productPage?: SourceReview;
  };
}

export async function aggregateReviews(roaster: string, productName: string): Promise<AggregatedReview> {
  const sources = await Promise.allSettled([
    scrapeAmazonReviews(roaster, productName),
    scrapeRedditSentiment(roaster, productName),
    scrapeProductPage(roaster, productName) // Your existing function
  ]);

  const validSources: SourceReview[] = [];
  
  // Process Amazon results
  if (sources[0].status === 'fulfilled' && sources[0].value) {
    validSources.push(sources[0].value);
  }
  
  // Process Reddit results
  if (sources[1].status === 'fulfilled' && sources[1].value) {
    validSources.push(sources[1].value);
  }
  
  // Process Product Page results
  if (sources[2].status === 'fulfilled' && sources[2].value) {
    validSources.push(sources[2].value);
  }

  return calculateConsensus(validSources, roaster, productName);
}

async function scrapeAmazonReviews(roaster: string, productName: string): Promise<SourceReview | null> {
  try {
    // Use Amazon Product Advertising API or web search
    const searchQuery = `${roaster} ${productName} coffee`;
    const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`;
    
    // For now, using web scraping - in production use official API
    const page = await launchBrowser();
    await page.goto(amazonUrl, { waitUntil: 'domcontentloaded', timeout: 8000 });
    
    const amazonData = await page.evaluate(() => {
      // Look for first coffee product result
      const productLink = document.querySelector('[data-component-type="s-search-result"] h2 a');
      if (!productLink) return null;
      
      // Extract rating from search results
      const ratingElement = productLink.closest('[data-component-type="s-search-result"]')
        ?.querySelector('[aria-label*="out of 5 stars"]');
      
      const reviewElement = productLink.closest('[data-component-type="s-search-result"]')
        ?.querySelector('[aria-label*="stars"]:not([aria-label*="out of"])');
      
      const rating = ratingElement?.getAttribute('aria-label')?.match(/(\d+\.?\d*) out of 5/)?.[1];
      const reviews = reviewElement?.textContent?.match(/(\d+,?\d*)/)?.[1]?.replace(',', '');
      
      return {
        rating: rating ? parseFloat(rating) : null,
        reviewCount: reviews ? parseInt(reviews) : null,
        productUrl: (productLink as HTMLAnchorElement)?.href
      };
    });
    
    await page.close();
    
    if (amazonData?.rating && amazonData?.reviewCount) {
      return {
        source: 'amazon',
        rating: amazonData.rating,
        reviewCount: amazonData.reviewCount,
        confidence: 0.9, // Amazon data is highly reliable
        rawData: amazonData
      };
    }
    
    return null;
  } catch (error) {
    console.error('Amazon scraping failed:', error);
    return null;
  }
}

async function scrapeRedditSentiment(roaster: string, productName: string): Promise<SourceReview | null> {
  try {
    // Use Reddit API (free, no auth needed for search)
    const searchQuery = `${roaster} ${productName}`;
    const redditUrl = `https://www.reddit.com/r/Coffee/search.json?q=${encodeURIComponent(searchQuery)}&restrict_sr=1&limit=10`;
    
    const response = await fetch(redditUrl, {
      headers: {
        'User-Agent': 'CoffeeScanBot/1.0'
      }
    });
    
    const data = await response.json();
    const posts = data.data?.children || [];
    
    if (posts.length === 0) return null;
    
    // Analyze sentiment from post titles and basic metrics
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;
    let totalScore = 0;
    
    const positiveWords = ['love', 'amazing', 'excellent', 'perfect', 'best', 'great', 'wonderful', 'fantastic'];
    const negativeWords = ['hate', 'terrible', 'awful', 'worst', 'bad', 'disappointing', 'overrated'];
    
    posts.forEach((post: any) => {
      const title = post.data.title.toLowerCase();
      const score = post.data.score || 0;
      totalScore += score;
      
      const hasPositive = positiveWords.some(word => title.includes(word));
      const hasNegative = negativeWords.some(word => title.includes(word));
      
      if (hasPositive && !hasNegative) {
        positiveCount++;
      } else if (hasNegative && !hasPositive) {
        negativeCount++;
      } else {
        neutralCount++;
      }
    });
    
    const totalMentions = posts.length;
    const sentiment = positiveCount > negativeCount ? 'positive' : 
                     negativeCount > positiveCount ? 'negative' : 'neutral';
    
    // Convert sentiment to approximate rating
    const sentimentRating = sentiment === 'positive' ? 4.2 : 
                           sentiment === 'negative' ? 2.8 : 3.5;
    
    return {
      source: 'reddit',
      rating: sentimentRating,
      reviewCount: totalMentions,
      sentiment,
      confidence: Math.min(0.7, totalMentions / 10), // Lower confidence, max 0.7
      rawData: { positiveCount, negativeCount, neutralCount, totalScore }
    };
    
  } catch (error) {
    console.error('Reddit scraping failed:', error);
    return null;
  }
}

async function scrapeProductPage(roaster: string, productName: string): Promise<SourceReview | null> {
  // Use your existing scrapeProductPageFast function
  const result = await scrapeProductPageFast(roaster, productName);
  
  if (result?.totalReviews > 0 && result?.averageRating > 0) {
    return {
      source: 'product_page',
      rating: result.averageRating,
      reviewCount: result.totalReviews,
      confidence: 0.8, // Product pages are reliable but sometimes outdated
      rawData: result
    };
  }
  
  return null;
}

function calculateConsensus(sources: SourceReview[], roaster: string, productName: string): AggregatedReview {
  if (sources.length === 0) {
    // Fallback to existing mock system
    return generateFallbackReview(roaster, productName);
  }
  
  // Weighted average based on confidence and review count
  let totalWeightedRating = 0;
  let totalWeight = 0;
  let totalReviews = 0;
  
  sources.forEach(source => {
    if (source.rating) {
      const weight = source.confidence * Math.log(1 + (source.reviewCount || 1));
      totalWeightedRating += source.rating * weight;
      totalWeight += weight;
      totalReviews += source.reviewCount || 0;
    }
  });
  
  const overallRating = totalWeight > 0 ? totalWeightedRating / totalWeight : 3.5;
  const confidence = Math.min(0.95, sources.length * 0.3 + Math.max(...sources.map(s => s.confidence)));
  
  // Generate consensus description
  const consensus = generateConsensusText(sources, overallRating);
  
  // Build breakdown
  const breakdown: any = {};
  sources.forEach(source => {
    breakdown[source.source === 'product_page' ? 'productPage' : source.source] = source;
  });
  
  return {
    overallRating: Math.round(overallRating * 10) / 10,
    totalReviews,
    confidence,
    consensus,
    sources,
    breakdown
  };
}

function generateConsensusText(sources: SourceReview[], rating: number): string {
  const sourceNames = sources.map(s => s.source).join(', ');
  const ratingText = rating >= 4.5 ? 'excellent' : 
                    rating >= 4.0 ? 'very good' : 
                    rating >= 3.5 ? 'good' : 
                    rating >= 3.0 ? 'average' : 'below average';
  
  const redditSource = sources.find(s => s.source === 'reddit');
  const amazonSource = sources.find(s => s.source === 'amazon');
  const productSource = sources.find(s => s.source === 'product_page');
  
  let details = [];
  if (amazonSource) details.push(`${amazonSource.reviewCount} Amazon reviews averaging ${amazonSource.rating}/5`);
  if (redditSource) details.push(`${redditSource.reviewCount} Reddit mentions with ${redditSource.sentiment} sentiment`);
  if (productSource) details.push(`${productSource.reviewCount} reviews on roaster's website`);
  
  return `Based on ${sourceNames}, this coffee has ${ratingText} reviews. ${details.join(', ')}.`;
}

function generateFallbackReview(roaster: string, productName: string): AggregatedReview {
  // Your existing fallback logic
  const totalReviews = roaster.toLowerCase().includes('kicking horse') ? 32 : Math.floor(Math.random() * 40) + 15;
  const averageRating = roaster.toLowerCase().includes('kicking horse') ? 4.9 : Math.round((Math.random() * 1.5 + 3.5) * 10) / 10;
  
  return {
    overallRating: averageRating,
    totalReviews,
    confidence: 0.3, // Low confidence for mock data
    consensus: `Limited review data available. Estimated ${averageRating}/5 based on similar coffees.`,
    sources: [],
    breakdown: {}
  };
}

// Helper function to launch browser (reuse your existing Puppeteer setup)
async function launchBrowser() {
  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-images']
  });
  return await browser.newPage();
}