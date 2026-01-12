import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PropertyCategory } from '../../types.ts';

interface CategoryCardProps {
  label: string;
  image: string;
  type: PropertyCategory;
}

const categorySlugs: Record<PropertyCategory, string> = {
  'Flats': 'flats',
  'Villa': 'villas',
  'Shop': 'shops',
  'Office': 'offices',
  'Plot': 'plots',
  'Agricultural': 'agricultural-lands',
  'Industrial': 'industrial-lands',
  'Warehouse': 'warehouses'
};

const CategoryCard: React.FC<CategoryCardProps> = ({ label, image, type }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/category/${categorySlugs[type]}`)}
      className="relative flex-shrink-0 w-[calc((100%-16px)/3)] md:w-[calc((100%-48px)/5)] aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group snap-start"
    >
      <img
        src={image}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-2 md:p-3">
        <h3 className="text-white font-bold text-[9px] md:text-[13px] tracking-tight group-hover:text-blue-400 transition-colors whitespace-normal leading-tight">
          {label}
        </h3>
      </div>
    </motion.div>
  );
};

export const CategoryGrid: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const categories: CategoryCardProps[] = [
    { label: 'Flats', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80', type: 'Flats' },
    { label: 'Villa/Row Houses', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&auto=format&fit=crop&q=80', type: 'Villa' },
    { label: 'Shops', image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&auto=format&fit=crop&q=80', type: 'Shop' },
    { label: 'Offices', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80', type: 'Office' },
    { label: 'Plots', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80', type: 'Plot' },
    { label: 'Agricultural Lands', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80', type: 'Agricultural' },
    { label: 'Industrial Lands', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&auto=format&fit=crop&q=80', type: 'Industrial' },
    { label: 'Warehouses', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80', type: 'Warehouse' }
  ];

  const displayCategories = [...categories, ...categories, ...categories];

  const handleStepScroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const firstCard = container.querySelector('.snap-start') as HTMLElement;
    if (!firstCard) return;

    const cardWidth = firstCard.offsetWidth;
    const gap = 12;
    const step = cardWidth + gap;
    
    let targetScroll = direction === 'right' 
      ? container.scrollLeft + step
      : container.scrollLeft - step;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    setTimeout(() => {
      if (!container) return;
      const singleSetWidth = (categories.length * step);
      if (container.scrollLeft >= singleSetWidth * 2) {
        container.scrollLeft -= singleSetWidth;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += singleSetWidth;
      }
    }, 600);
  }, [categories.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        handleStepScroll('right');
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused, handleStepScroll]);

  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const setupPosition = () => {
        const firstCard = container.querySelector('.snap-start') as HTMLElement;
        if (firstCard) {
          const step = firstCard.offsetWidth + 12;
          container.scrollLeft = categories.length * step;
        }
      };
      const timeoutId = setTimeout(setupPosition, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [categories.length]);

  return (
    <section className="py-12 bg-white overflow-hidden relative border-b border-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6 text-center">
        <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">Marketplace</span>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase">Explore Categories</h2>
      </div>

      <div 
        className="relative max-w-7xl mx-auto px-6 md:px-14"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <button 
          onClick={() => handleStepScroll('left')}
          className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 md:w-9 md:h-9 bg-white border border-slate-200 flex items-center justify-center rounded-full text-slate-900 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>
        <button 
          onClick={() => handleStepScroll('right')}
          className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-30 w-7 h-7 md:w-9 md:h-9 bg-white border border-slate-200 flex items-center justify-center rounded-full text-slate-900 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
        >
          <ChevronRight size={16} />
        </button>

        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-hidden whitespace-nowrap scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayCategories.map((cat, idx) => (
            <CategoryCard key={`${cat.type}-${idx}`} {...cat} />
          ))}
        </div>
      </div>
    </section>
  );
};