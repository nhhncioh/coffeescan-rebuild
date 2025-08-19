'use client'

import { useState } from 'react'

interface ImageUploaderProps {
  onImageSelect: (file: File) => void
  isProcessing?: boolean
}

export default function ImageUploader({ 
  onImageSelect, 
  isProcessing = false 
}: ImageUploaderProps) {
  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded">
      <h3>Upload Coffee Photo</h3>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onImageSelect(file)
        }}
        disabled={isProcessing}
      />
    </div>
  )
}