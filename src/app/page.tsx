'use client'

import { useState } from 'react'
import ImageUploader from '../components/ImageUploader'
import ReviewsSection from '../components/ReviewsSection'

interface ScanResult {
  id: string
  extraction: {
    roaster: string
    productName: string
    origin?: string
    roastLevel?: string
    flavorNotes: string[]
    weight?: string
    processingMethod?: string
    certifications?: string[]
    // ... other extraction fields
  }
  reviews?: {
    rating?: number
    averageRating?: number
    totalReviews?: number
    recentReviews?: Array<{
      rating: number
      text: string
      date: string
    }>
    source?: string
    lastUpdated?: string
  }
  confidence: number
  processingMethod: string
  processingTime: number
}

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async () => {
    if (!file) return

    setIsScanning(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/scan', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
        console.log('Scan result:', data.data)
      } else {
        setError(data.error || 'Scan failed')
      }
    } catch (err) {
      console.error('Scan error:', err)
      setError('Network error occurred')
    } finally {
      setIsScanning(false)
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-coffee-900 mb-4">
            Coffee Scanner
          </h1>
          <p className="text-lg text-coffee-600">
            Discover your coffee's story with AI-powered analysis
          </p>
        </div>
        
        {/* Upload Section */}
        {!file && !result && (
          <div className="glass rounded-2xl p-8 mb-8">
            <ImageUploader onImageSelect={setFile} />
          </div>
        )}

        {/* Scanning Section */}
        {file && !result && (
          <div className="glass rounded-2xl p-8 mb-8">
            <div className="text-center">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-coffee-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-coffee-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-coffee-900 mb-2">
                  {file.name}
                </h3>
                <p className="text-coffee-600 mb-6">
                  Ready to analyze your coffee
                </p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="scan-button flex items-center space-x-2"
                >
                  {isScanning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Scan Coffee</span>
                    </>
                  )}
                </button>
                
                <button 
                  onClick={reset}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-8">
            {/* Main Coffee Information */}
            <div className="glass rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-coffee-900">
                  Coffee Identified!
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-coffee-600">Confidence:</span>
                  <span className="px-3 py-1 bg-coffee-100 text-coffee-800 rounded-full text-sm font-medium">
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Coffee Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-coffee-900 mb-2">
                      Basic Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-coffee-600">Roaster:</span>
                        <span className="font-medium text-coffee-900">{result.extraction.roaster}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-coffee-600">Coffee:</span>
                        <span className="font-medium text-coffee-900">{result.extraction.productName}</span>
                      </div>
                      {result.extraction.origin && (
                        <div className="flex justify-between">
                          <span className="text-coffee-600">Origin:</span>
                          <span className="font-medium text-coffee-900">{result.extraction.origin}</span>
                        </div>
                      )}
                      {result.extraction.roastLevel && (
                        <div className="flex justify-between">
                          <span className="text-coffee-600">Roast Level:</span>
                          <span className="font-medium text-coffee-900 capitalize">{result.extraction.roastLevel}</span>
                        </div>
                      )}
                      {result.extraction.weight && (
                        <div className="flex justify-between">
                          <span className="text-coffee-600">Weight:</span>
                          <span className="font-medium text-coffee-900">{result.extraction.weight}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {result.extraction.certifications && result.extraction.certifications.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-coffee-800 mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.extraction.certifications.map((cert, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {result.extraction.flavorNotes && result.extraction.flavorNotes.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-coffee-800 mb-2">Flavor Notes</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.extraction.flavorNotes.map((note, index) => (
                          <span key={index} className="px-3 py-1 bg-coffee-100 text-coffee-800 text-sm rounded-full">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-md font-medium text-coffee-800 mb-2">Processing Info</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-coffee-600">Method:</span> {result.processingMethod}</p>
                      <p><span className="text-coffee-600">Time:</span> {result.processingTime}ms</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewsSection 
              reviews={result.reviews}
              roaster={result.extraction.roaster}
              productName={result.extraction.productName}
            />

            {/* Action Buttons */}
            <div className="text-center">
              <button 
                onClick={reset}
                className="scan-button"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Scan Another Coffee
              </button>
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="glass rounded-2xl p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-1">
                  Scan Failed
                </h3>
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={reset}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}