'use client'

// src/components/ImageUploader.tsx - Optimized with Client-Side Compression

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function ImageUploader({ onImageSelect, isProcessing }: ImageUploaderProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)

  // Client-side image compression for faster upload and processing
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      
      img.onload = () => {
        // Target max width/height of 1024px for optimal balance of quality vs speed
        const maxSize = 1024
        let { width, height } = img
        
        // Calculate scaling to maintain aspect ratio
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file) // Fallback to original if compression fails
            }
          },
          'image/jpeg',
          0.85 // 85% quality - good balance of quality vs size
        )
      }

      img.onerror = () => resolve(file) // Fallback to original if image load fails
      img.src = URL.createObjectURL(file)
    })
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      
      // Show compression state for larger files
      if (file.size > 1024 * 1024) { // > 1MB
        setIsCompressing(true)
      }
      
      try {
        // Compress image before sending
        const compressedFile = await compressImage(file)
        
        console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
        console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
        
        onImageSelect(compressedFile)
      } catch (error) {
        console.error('Compression failed, using original:', error)
        onImageSelect(file) // Fallback to original file
      } finally {
        setIsCompressing(false)
      }
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    disabled: isProcessing || isCompressing
  });

  const getButtonText = () => {
    if (isCompressing) return 'OPTIMIZING...'
    if (isProcessing) return 'SCANNING...'
    if (isDragActive) return 'DROP IT!'
    return 'TAP TO SCAN'
  }

  const getStatusEmoji = () => {
    if (isCompressing) return '⚡'
    if (isProcessing) return '🔍'
    return '📷'
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Floating Action Button Style */}
      <div className="relative">
        <div
          {...getRootProps()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            relative overflow-hidden cursor-pointer transform transition-all duration-500 ease-out
            ${isDragActive ? 'scale-110 rotate-3' : isHovered ? 'scale-105' : 'scale-100'}
            ${isProcessing || isCompressing ? 'animate-pulse' : ''}
            ${isProcessing || isCompressing ? 'pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {/* Main Circle Button */}
          <div className={`
            w-32 h-32 mx-auto rounded-full relative
            ${isDragActive ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 
              isCompressing ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
              isProcessing ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
              isHovered ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
              'bg-gradient-to-br from-orange-400 to-red-500'}
            shadow-2xl flex items-center justify-center
            transition-all duration-300 ease-out
          `}>
            
            {/* Ripple Effect */}
            <div className={`
              absolute inset-0 rounded-full
              ${isDragActive ? 'animate-ping bg-green-300' : 
                isCompressing ? 'animate-ping bg-yellow-300' :
                isProcessing ? 'animate-ping bg-blue-300' : ''}
            `}></div>
            
            {/* Center Content */}
            <div className="relative z-10 text-white text-center">
              {(isProcessing || isCompressing) ? (
                <div className="space-y-2">
                  <div className="w-8 h-8 mx-auto border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-xs font-bold">
                    {isCompressing ? 'OPTIMIZING...' : 'SCANNING...'}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl">{getStatusEmoji()}</div>
                  <div className="text-xs font-bold tracking-wider">
                    {getButtonText()}
                  </div>
                </div>
              )}
            </div>
            
            {/* Glow Effect */}
            <div className={`
              absolute -inset-4 rounded-full opacity-30 blur-xl
              ${isDragActive ? 'bg-green-400' : 
                isCompressing ? 'bg-yellow-400' :
                isProcessing ? 'bg-blue-400' :
                isHovered ? 'bg-purple-400' : 'bg-orange-400'}
              transition-all duration-300
            `}></div>
          </div>
        </div>
        
        {/* Floating Instruction */}
        <div className={`
          mt-6 text-center transition-all duration-300
          ${isDragActive ? 'transform scale-110' : ''}
        `}>
          <div className="inline-block bg-white rounded-full px-4 py-2 shadow-lg border">
            <div className="text-sm font-medium text-gray-800">
              {isDragActive ? 'Release to analyze!' : 
               isCompressing ? 'Optimizing image for faster processing...' :
               isProcessing ? 'Analyzing your coffee with AI...' :
               'Snap or drop your coffee bag photo'}
            </div>
          </div>
        </div>
        
        {/* Feature Dots */}
        <div className="flex justify-center space-x-2 mt-4">
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isCompressing ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isProcessing ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Bottom Text */}
        <div className="text-center mt-6 space-y-1">
          <div className="text-xs text-gray-500">JPG • PNG • WebP</div>
          <div className="text-xs text-gray-400">Auto-optimized for speed</div>
        </div>
      </div>
      
      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`
          absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10
          ${isDragActive ? 'bg-green-400 animate-pulse' : 
            isCompressing ? 'bg-yellow-400 animate-pulse' :
            isProcessing ? 'bg-blue-400 animate-pulse' : 'bg-blue-400'}
          transition-all duration-1000
        `}></div>
        <div className={`
          absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-10
          ${isDragActive ? 'bg-emerald-400 animate-pulse' : 
            isCompressing ? 'bg-orange-400 animate-pulse' :
            isProcessing ? 'bg-indigo-400 animate-pulse' : 'bg-purple-400'}
          transition-all duration-1000 delay-300
        `}></div>
      </div>
    </div>
  );
}