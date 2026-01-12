import React from 'react';
import { HeroSection } from './Home/HeroSection.tsx';
import { CategoryGrid } from './Home/CategoryGrid.tsx';
import { FeaturedProperties } from './Home/PropertyCards.tsx';
import { ExploreNearby } from './Home/ExploreNearby.tsx';
import { ProcessSteps } from './Home/ProcessSteps.tsx';
import { AboutSection } from './Home/AboutSection.tsx';
import { CTASection } from './Home/CTASection.tsx';

export const HomePage: React.FC = () => {
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
};