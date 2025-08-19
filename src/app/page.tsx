'use client'

import { useState } from 'react'
import ImageUploader from '../components/ImageUploader'

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
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
      } else {
        setError(data.error || 'Scan failed')
      }
    } catch (err) {
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
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Coffee Scanner</h1>
      
      {!file && !result && (
        <ImageUploader onImageSelect={setFile} />
      )}

      {file && !result && (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <p className="mb-4">File selected: {file.name}</p>
          <div className="flex space-x-4">
            <button 
              onClick={handleScan}
              disabled={isScanning}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isScanning ? 'Scanning...' : 'Scan Coffee'}
            </button>
            <button 
              onClick={reset}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Coffee Identified!</h2>
          <div className="space-y-2">
            <p><strong>Roaster:</strong> {result.extraction.roaster}</p>
            <p><strong>Coffee:</strong> {result.extraction.productName}</p>
            <p><strong>Origin:</strong> {result.extraction.origin}</p>
            <p><strong>Roast Level:</strong> {result.extraction.roastLevel}</p>
            <p><strong>Flavor Notes:</strong> {result.extraction.flavorNotes?.join(', ')}</p>
            <p><strong>Confidence:</strong> {Math.round(result.confidence * 100)}%</p>
          </div>
          <button 
            onClick={reset}
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Scan Another
          </button>
        </div>
      )}

      {error && (
        <div className="max-w-md mx-auto p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}
    </div>
  )
}
