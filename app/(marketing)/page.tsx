import React from 'react';
import { HeroSection } from '@/components/Home/HeroSection';
import { CategoryGrid } from '@/components/Home/CategoryGrid';
import { FeaturedProperties } from '@/components/Home/FeaturedProperties';
import { ExploreNearby } from '@/components/Home/ExploreNearby';
import { ProcessSteps } from '@/components/Home/ProcessSteps';
import { AboutSection } from '@/components/Home/AboutSection';
import { CTASection } from '@/components/Home/CTASection';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      
      {/* Category Navigation Section */}
      <CategoryGrid />
      
      {/* Featured Section */}
      <div className="bg-slate-50">
        <FeaturedProperties />
      </div>

      {/* About Us Section - Mirroring requested UI */}
      <AboutSection />

      {/* How It Works Section */}
      <ProcessSteps />

      {/* Explore Nearby Section */}
      <ExploreNearby />

      {/* Final Call to Action */}
      <CTASection />
    </div>
  );
}
