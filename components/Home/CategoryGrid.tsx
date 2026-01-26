'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PropertyCategory } from '@/types';

interface CategoryCardProps {
  label: string;
  image: string;
  slug: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ label, image, slug }) => {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ y: -3 }}
      onClick={() => router.push(`/category/${slug}`)}
      className="relative flex-shrink-0 w-[calc((100%-16px)/3)] md:w-[calc((100%-48px)/5)] aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group snap-start"
    >
      <img
        src={image}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 p-3 md:p-4 flex items-start justify-start">
        <h3 className="text-black font-bold text-xs md:text-base tracking-tight capitalize leading-none whitespace-pre-line">
          {label}
        </h3>
      </div>
    </motion.div>
  );
};

export const CategoryGrid: React.FC = () => {
  const categories: CategoryCardProps[] = [
    { label: 'Residential\nApartments', image: '/assets/categories/flats.png', slug: 'residential-apartments' },
    { label: 'Villas/\nRowhouses', image: '/assets/categories/villa.png', slug: 'villas-rowhouses' },
    { label: 'Commercial\nSpaces', image: '/assets/categories/commercial.png', slug: 'commercial-spaces' },
    { label: 'Plots', image: '/assets/categories/plots.png', slug: 'plots' },
    { label: 'Industrial\nSpaces', image: '/assets/categories/industrial.png', slug: 'industrial-spaces' },
  ];

  return (
    <section className="pt-4 pb-8 md:py-12 bg-white overflow-hidden relative border-b border-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-6 text-center">
        <span className="text-blue-600 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] mb-2 block">Marketplace</span>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">Explore Categories</h2>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-14">
        <div 
          className="flex gap-3 overflow-x-auto whitespace-nowrap scroll-smooth snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat, idx) => (
            <CategoryCard key={`${cat.slug}-${idx}`} {...cat} />
          ))}
        </div>
      </div>
    </section>
  );
};
