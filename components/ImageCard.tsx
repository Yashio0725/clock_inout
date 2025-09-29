"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

interface ImageCardProps {
  className?: string;
}

export default function ImageCard({ className = "" }: ImageCardProps) {
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 画像リストを取得
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/media/images");
        if (response.ok) {
          const imageList = await response.json();
          setImages(imageList);
        }
      } catch (error) {
        console.error("画像の取得に失敗しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  // 次の画像に切り替え
  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  // 前の画像に切り替え
  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-slate-800/50 rounded-lg p-6 border border-slate-600 backdrop-blur-sm ${className}`}>
        <div className="flex items-center justify-center aspect-video">
          <div className="flex items-center space-x-2 text-slate-400">
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            <span className={orbitron.className}>Loading images...</span>
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`bg-slate-800/50 rounded-lg p-6 border border-slate-600 backdrop-blur-sm ${className}`}>
        <h3 className={`text-xl font-semibold text-white mb-4 flex items-center ${orbitron.className}`}>
          <div className="w-1 h-6 bg-cyan-400 rounded-full mr-3"></div>
          Image Gallery
        </h3>
        <div className="flex items-center justify-center aspect-video bg-slate-700/30 rounded-lg border-2 border-dashed border-slate-600">
          <div className="text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className={`text-sm ${orbitron.className}`}>No images available</p>
            <p className={`text-xs mt-1 ${orbitron.className}`}>Add images to public/media/ folder</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-800/50 rounded-lg p-6 border border-slate-600 backdrop-blur-sm ${className}`}>
      <h3 className={`text-xl font-semibold text-white mb-4 flex items-center ${orbitron.className}`}>
        <div className="w-1 h-6 bg-cyan-400 rounded-full mr-3"></div>
        Image Gallery
        <span className={`ml-auto text-sm text-slate-400 font-normal ${orbitron.className}`}>
          {currentImageIndex + 1} / {images.length}
        </span>
      </h3>
      
      <div className="relative bg-slate-700/30 rounded-lg overflow-hidden border border-slate-600">
        <div className="relative aspect-video">
          <Image
            src={images[currentImageIndex]}
            alt={`Image ${currentImageIndex + 1}`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* ナビゲーションボタン */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/80 text-white p-2 rounded-full transition-colors"
                aria-label="Previous image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/80 text-white p-2 rounded-full transition-colors"
                aria-label="Next image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        {/* サムネイル表示 */}
        {images.length > 1 && (
          <div className="p-3 bg-slate-800/50">
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-12 h-12 rounded border-2 transition-all ${
                    index === currentImageIndex
                      ? "border-cyan-400 ring-2 ring-cyan-400/50"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
