'use client'

// src/components/ImageUploader.tsx - Revolutionary Mobile-First Design

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function ImageUploader({ onImageSelect, isProcessing }: ImageUploaderProps) {
  const [isHovered, setIsHovered] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    disabled: isProcessing
  });

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
            ${isProcessing ? 'animate-pulse' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {/* Main Circle Button */}
          <div className={`
            w-32 h-32 mx-auto rounded-full relative
            ${isDragActive ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 
              isHovered ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
              'bg-gradient-to-br from-orange-400 to-red-500'}
            shadow-2xl flex items-center justify-center
            transition-all duration-300 ease-out
          `}>
            
            {/* Ripple Effect */}
            <div className={`
              absolute inset-0 rounded-full
              ${isDragActive ? 'animate-ping bg-green-300' : ''}
            `}></div>
            
            {/* Center Content */}
            <div className="relative z-10 text-white text-center">
              {isProcessing ? (
                <div className="space-y-2">
                  <div className="w-8 h-8 mx-auto border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-xs font-bold">SCANNING...</div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl">📷</div>
                  <div className="text-xs font-bold tracking-wider">
                    {isDragActive ? 'DROP IT!' : 'TAP TO SCAN'}
                  </div>
                </div>
              )}
            </div>
            
            {/* Glow Effect */}
            <div className={`
              absolute -inset-4 rounded-full opacity-30 blur-xl
              ${isDragActive ? 'bg-green-400' : 
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
               isProcessing ? 'Analyzing your coffee...' :
               'Snap or drop your coffee bag photo'}
            </div>
          </div>
        </div>
        
        {/* Feature Dots */}
        <div className="flex justify-center space-x-2 mt-4">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Bottom Text */}
        <div className="text-center mt-6 space-y-1">
          <div className="text-xs text-gray-500">JPG • PNG • WebP</div>
          <div className="text-xs text-gray-400">Max 10MB</div>
        </div>
      </div>
      
      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`
          absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10
          ${isDragActive ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}
          transition-all duration-1000
        `}></div>
        <div className={`
          absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-10
          ${isDragActive ? 'bg-emerald-400 animate-pulse' : 'bg-purple-400'}
          transition-all duration-1000 delay-300
        `}></div>
      </div>
    </div>
  );
}