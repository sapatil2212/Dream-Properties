'use client';

import React, { Suspense } from 'react';
import { PropertiesList } from '@/components/PropertiesList';

export default function SellPropertiesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PropertiesList listingType="Sell" />
    </Suspense>
  );
}
