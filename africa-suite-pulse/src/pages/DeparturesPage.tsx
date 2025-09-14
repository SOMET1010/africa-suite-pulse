import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import DeparturesFeature from '@/features/departures/DeparturesPage';

export default function DeparturesPage() {
  return (
    <GlobalNavigationLayout>
      <DeparturesFeature />
    </GlobalNavigationLayout>
  );
}