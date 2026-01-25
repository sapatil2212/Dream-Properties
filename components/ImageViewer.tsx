'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/UIComponents';

interface ImageViewerProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ 
  images, 
  initialIndex, 
  isOpen, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [initialIndex, isOpen]);

  if (!isOpen) return null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(prev => Math.max(prev - 0.5, 1));
    if (zoom <= 1.5) setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[20000] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200" 
      onClick={onClose}
    >
      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-[20001]">
        <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={handleZoomOut} disabled={zoom <= 1}>
            <ZoomOut size={16} />
          </Button>
          <span className="text-white text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={handleZoomIn} disabled={zoom >= 3}>
            <ZoomIn size={16} />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-10 w-10 rounded-full bg-white/5" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      {/* Main Image Area */}
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden p-4 sm:p-10"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className={`transition-transform duration-200 ease-out ${isDragging ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : ''}`}
          style={{ 
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
        >
          <img 
            src={images[currentIndex]} 
            alt={`Property view ${currentIndex + 1}`} 
            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm select-none"
            draggable={false}
          />
        </div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-110 z-[20002]"
            onClick={handlePrev}
          >
            <ChevronLeft size={32} />
          </button>
        )}
        {currentIndex < images.length - 1 && (
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hover:scale-110 z-[20002]"
            onClick={handleNext}
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Thumbnails Strip */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[90vw] overflow-x-auto no-scrollbar py-2 z-[20001]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setZoom(1);
                setPosition({ x: 0, y: 0 });
              }}
              className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                idx === currentIndex ? 'border-white scale-110 ring-2 ring-black/20' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageViewer;
