import React from 'react';
import { MainAppLayout } from '@/core/layout/MainAppLayout';
import PlatformPresentation from './PlatformPresentation';

export default function PresentationRoute() {
  return (
    <MainAppLayout>
      <PlatformPresentation />
    </MainAppLayout>
  );
}