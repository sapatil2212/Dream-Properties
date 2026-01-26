'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface NearbyLocation {
  id: string;
  name: string;
  description: string;
  tags: string[];
  image: string;
}

const NEARBY_LOCATIONS: NearbyLocation[] = [
  { 
    id: '1', 
    name: 'Trimbakeshwar Jyotirlinga Temple', 
    description: 'One of the 12 sacred Jyotirlingas of Lord Shiva, located near the Brahmagiri Hills.', 
    tags: ['Spiritual', 'Historic', 'Peaceful'],
    image: '/assets/categories/industrial.png'
  },
  { 
    id: '2', 
    name: 'Sula Vineyards', 
    description: 'India’s most famous vineyard — wine tasting, tours, sunset views & restaurants.', 
    tags: ['Luxury', 'Nature', 'Couples', 'Photography'],
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&auto=format&fit=crop&q=80' 
  },
  { 
    id: '3', 
    name: 'Panchavati & Ramkund', 
    description: 'The heart of Nashik’s spiritual heritage with temples and holy ghats.', 
    tags: ['Religious', 'Cultural', 'Riverfront'],
    image: 'https://images.unsplash.com/photo-1564850125433-28f057866e4d?w=600&auto=format&fit=crop&q=80' 
  },
  { 
    id: '4', 
    name: 'Pandav Leni (Trirashmi Caves)', 
    description: '2000-year-old Buddhist caves carved into the hills with a city view.', 
    tags: ['History', 'Trekking', 'Scenic'],
    image: 'https://images.unsplash.com/photo-1592345279419-959d784e8aad?w=600&auto=format&fit=crop&q=80' 
  },
  { 
    id: '5', 
    name: 'Saptashringi Devi Temple', 
    description: 'Hilltop Shakti Peeth with ropeway access and panoramic mountain views.', 
    tags: ['Pilgrimage', 'Nature', 'Ropeway'],
    image: 'https://images.unsplash.com/photo-1591530268509-5f21295e8b0a?w=600&auto=format&fit=crop&q=80' 
  },
  { 
    id: '6', 
    name: 'Someshwar Waterfall', 
    description: 'A beautiful seasonal waterfall perfect during monsoon.', 
    tags: ['Nature', 'Picnic', 'Monsoon Spot'],
    image: 'https://images.unsplash.com/photo-1516972238977-89271fb2bab8?w=600&auto=format&fit=crop&q=80' 
  },
  { 
    id: '7', 
    name: 'Harihar Fort', 
    description: 'Famous fort with a thrilling vertical rock staircase trek.', 
    tags: ['Adventure', 'Trekking', 'Instagram Spot'],
    image: 'https://images.unsplash.com/photo-1598944565691-10c000672044?w=600&auto=format&fit=crop&q=80' 
  },
  { 
    id: '8', 
    name: 'Muktidham Temple', 
    description: 'White marble temple complex with replicas of 12 Jyotirlingas.', 
    tags: ['Architecture', 'Calm', 'Family Friendly'],
    image: 'https://images.unsplash.com/photo-1621829676572-c2b627293f06?w=600&auto=format&fit=crop&q=80' 
  },
  { 
    id: '9', 
    name: 'Nandur Madhyameshwar Bird Sanctuary', 
    description: 'Maharashtra’s “Bharatpur” — paradise for bird lovers and nature photographers.', 
    tags: ['Wildlife', 'Nature', 'Photography'],
    image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea218?w=600&auto=format&fit=crop&q=80' 
  },
];

export const ExploreNearby: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10">
          <span className="text-blue-600 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] mb-2 block">Discover Locations</span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-1 uppercase tracking-tight">Explore nearby</h2>
        </div>

        {/* Fixed 3x3 Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {NEARBY_LOCATIONS.map((loc, idx) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
              className="relative flex flex-row items-start p-3 md:p-4 bg-white border border-gray-100 rounded-2xl transition-all cursor-pointer group hover:shadow-lg hover:border-blue-100"
            >
              {/* Circle Image */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border border-gray-100 shadow-sm shrink-0 mr-4">
                <img 
                  src={loc.image} 
                  alt={loc.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-col min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 text-sm md:text-base leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {loc.name}
                </h3>
                <p className="text-slate-500 text-[10px] md:text-[11px] font-medium leading-relaxed mb-2 line-clamp-2">
                  {loc.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {loc.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
