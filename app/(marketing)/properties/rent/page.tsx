'use client';

import React, { Suspense } from 'react';
import { PropertiesList } from '@/components/PropertiesList';

export default function RentPropertiesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PropertiesList listingType="Rent" />
    </Suspense>
  );
}
