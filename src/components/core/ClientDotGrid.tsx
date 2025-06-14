// src/components/core/ClientDotGrid.tsx
'use client';

import dynamic from 'next/dynamic';
import type { DotGridProps } from './DotGrid'; // Assuming DotGridProps is exported from DotGrid.tsx

// Dynamically import DotGrid with SSR disabled
const DynamicDotGrid = dynamic(() => import('@/components/core/DotGrid'), {
  ssr: false,
});

// This component will pass through all props to the dynamically imported DotGrid
const ClientDotGrid: React.FC<DotGridProps> = (props) => {
  return <DynamicDotGrid {...props} />;
};

export default ClientDotGrid;
