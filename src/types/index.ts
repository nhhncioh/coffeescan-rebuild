// Core types for the coffee scanning application

export interface CoffeeExtraction {
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

export interface ScanResult {
  id: string;
  extraction: CoffeeExtraction;
  confidence: number;
  processingMethod: 'vision' | 'ocr' | 'hybrid';
  processingTime: number;
  imageUrl?: string;
  recommendations?: CoffeeRecommendation[];
  roasterMatch?: RoasterMatch;
}

export interface RoasterMatch {
  id: number;
  name: string;
  domain?: string;
  website?: string;
  location?: string;
  confidence: number;
  verified: boolean;
}

export interface CoffeeRecommendation {
  id: number;
  coffee: {
    id: number;
    name: string;
    roaster: {
      name: string;
      location?: string;
    };
    origin?: string;
    roastLevel?: string;
    flavorNotes: string[];
    price?: number;
    imageUrl?: string;
  };
  similarityScore: number;
  reason: string;
  type: 'content' | 'collaborative' | 'hybrid';
}

export interface ProcessingOptions {
  method?: 'vision' | 'ocr' | 'auto';
  enhanceImage?: boolean;
  extractionDepth?: 'basic' | 'detailed';
}

export interface UserFeedback {
  scanId: string;
  extractionAccuracy?: number; // 1-5
  recommendationQuality?: number; // 1-5
  corrections?: Partial<CoffeeExtraction>;
  comments?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    processingTime?: number;
    version?: string;
    rateLimit?: {
      remaining: number;
      reset: number;
    };
  };
}

export interface ScanApiRequest {
  image: File;
  options?: ProcessingOptions;
}

export interface ScanApiResponse extends ApiResponse<ScanResult> {}

// Vision API Types
export interface VisionExtractionResult {
  rawResponse: string;
  structuredData: CoffeeExtraction;
  confidence: number;
  tokensUsed?: number;
}

// OCR Types
export interface OcrResult {
  text: string;
  confidence: number;
  processingTime: number;
  lines: string[];
}

// Database Entity Types (matching Prisma schema)
export interface Roaster {
  id: number;
  name: string;
  domain?: string;
  website?: string;
  location?: string;
  city?: string;
  region?: string;
  country?: string;
  specialty?: string;
  description?: string;
  logoUrl?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coffee {
  id: number;
  roasterId: number;
  name: string;
  description?: string;
  origin?: string;
  region?: string;
  farm?: string;
  varietal: string[];
  processingMethod?: string;
  roastLevel?: string;
  flavorNotes: string[];
  altitude?: number;
  harvestYear?: number;
  price?: number;
  weightGrams?: number;
  imageUrl?: string;
  available: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  roaster?: Roaster;
}

export interface UserScan {
  id: number;
  imageUrl?: string;
  originalFilename?: string;
  imageWidth?: number;
  imageHeight?: number;
  processingMethod: string;
  confidenceScore?: number;
  processingTimeMs?: number;
  extractedData?: any;
  roasterId?: number;
  userFeedback?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// UI Component Props
export interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  isProcessing?: boolean;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

export interface ScanResultsProps {
  result: ScanResult;
  onFeedback?: (feedback: UserFeedback) => void;
  showRecommendations?: boolean;
}

export interface CoffeeCardProps {
  coffee: Coffee;
  showPrice?: boolean;
  showActions?: boolean;
  onClick?: () => void;
}

// Search and Filter Types
export interface SearchFilters {
  roaster?: string;
  origin?: string;
  roastLevel?: string[];
  flavorNotes?: string[];
  priceRange?: [number, number];
  available?: boolean;
}

export interface SearchResult {
  coffees: Coffee[];
  total: number;
  page: number;
  pageSize: number;
  filters: SearchFilters;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export type ErrorCode = 
  | 'INVALID_IMAGE'
  | 'PROCESSING_FAILED'
  | 'API_LIMIT_EXCEEDED'
  | 'VISION_API_ERROR'
  | 'OCR_FAILED'
  | 'DATABASE_ERROR'
  | 'UNKNOWN_ERROR';

// Utility Types
export type ScanStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

export type RoastLevel = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark' | 'very-dark';

export type ProcessingMethod = 
  | 'washed' 
  | 'natural' 
  | 'honey' 
  | 'wet-hulled' 
  | 'experimental' 
  | 'anaerobic'
  | 'carbonic-maceration';

export type BrewMethod = 
  | 'espresso' 
  | 'drip' 
  | 'pour-over' 
  | 'french-press' 
  | 'aeropress' 
  | 'cold-brew'
  | 'chemex'
  | 'v60';

// Configuration Types
export interface AppConfig {
  vision: {
    provider: 'openai' | 'google' | 'anthropic';
    model: string;
    maxTokens: number;
    temperature: number;
  };
  ocr: {
    enabled: boolean;
    language: string;
    fallbackEnabled: boolean;
  };
  upload: {
    maxFileSize: number;
    allowedTypes: string[];
    compression: boolean;
  };
  recommendations: {
    maxResults: number;
    algorithm: 'content' | 'collaborative' | 'hybrid';
    minSimilarity: number;
  };
}