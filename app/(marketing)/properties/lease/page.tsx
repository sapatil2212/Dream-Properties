'use client';

import React, { Suspense } from 'react';
import { PropertiesList } from '@/components/PropertiesList';

export default function LeasePropertiesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PropertiesList listingType="Lease" />
    </Suspense>
  );
}
