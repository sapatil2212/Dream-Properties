import React from 'react';
import { motion } from 'framer-motion';

interface NearbyLocation {
  id: string;
  name: string;
  distance: string;
  count: string;
  image: string;
}

const NEARBY_LOCATIONS: NearbyLocation[] = [
  { id: '1', name: 'New York, USA', distance: '19 minutes drive', count: '+5,000', image: 'https://images.unsplash.com/photo-1496422266666-8d4d0e62e6e9?w=400&auto=format&fit=crop&q=60' },
  { id: '2', name: 'Singapore', distance: '19 minutes drive', count: '+2,500', image: 'https://images.unsplash.com/photo-1525625293386-3fb0ad7c1fd6?w=400&auto=format&fit=crop&q=60' },
  { id: '3', name: 'Paris, France', distance: '19 minutes drive', count: '+3,000', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&auto=format&fit=crop&q=60' },
  { id: '4', name: 'London, UK', distance: '19 minutes drive', count: '+116,288', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&auto=format&fit=crop&q=60' },
  { id: '5', name: 'Tokyo, Japan', distance: '19 minutes drive', count: '+5,000', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&auto=format&fit=crop&q=60' },
  { id: '6', name: 'Maldives', distance: '19 minutes drive', count: '+7,500', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&auto=format&fit=crop&q=60' },
  { id: '7', name: 'Roma, Italy', distance: '19 minutes drive', count: '+8,100', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&auto=format&fit=crop&q=60' },
  { id: '8', name: 'Nashik, India', distance: '19 minutes drive', count: '+12,400', image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=400&auto=format&fit=crop&q=60' },
  { id: '9', name: 'Nature Parks', distance: '19 minutes drive', count: '+15,600', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b4470?w=400&auto=format&fit=crop&q=60' },
];

export const ExploreNearby: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1 uppercase tracking-tight">Explore nearby</h2>
          <p className="text-gray-500 text-[11px] md:text-sm font-bold uppercase tracking-widest">Great places near where you live</p>
        </div>

        {/* Fixed 3x3 Grid Container */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {NEARBY_LOCATIONS.map((loc, idx) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.02 }}
              whileHover={{ y: -2 }}
              className="relative flex flex-col sm:flex-row items-center p-2 md:p-4 bg-white border border-gray-100 rounded-xl transition-all cursor-pointer group"
            >
              {/* Badge */}
              <div className="absolute top-1 right-1 md:top-2 md:right-3 px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[6px] md:text-[9px] font-bold rounded-md">
                {loc.count}
              </div>

              {/* Circle Image */}
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full overflow-hidden border border-white shadow-sm shrink-0 mb-1.5 sm:mb-0 sm:mr-3">
                <img 
                  src={loc.image} 
                  alt={loc.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Text Content */}
              <div className="flex flex-col min-w-0 text-center sm:text-left">
                <h3 className="font-bold text-gray-900 text-[8px] md:text-[13px] truncate md:pr-6 leading-tight">
                  {loc.name}
                </h3>
                <p className="text-gray-400 text-[6px] md:text-[10px] font-medium truncate">
                  {loc.distance}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};