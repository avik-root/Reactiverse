// src/components/core/ClientDotGrid.tsx
'use client';

import dynamic from 'next/dynamic';
import type { DotGridProps } from './DotGrid'; // Assuming DotGridProps is exported from DotGrid.tsx

// Dynamically import DotGrid with SSR disabled and a loading fallback
const DynamicDotGrid = dynamic(() => import('@/components/core/DotGrid'), {
  ssr: false,
  loading: () => (
    // Use a simple div with the same base class as DotGrid to maintain background styling
    // The actual interactive dots will only appear once the component loads.
    // The dot-grid class should provide the themed background color.
    <div 
      className="dot-grid" 
      style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: -10 }}
      aria-hidden="true" // Hide from accessibility tree as it's a visual placeholder
    />
  ),
});

// This component will pass through all props to the dynamically imported DotGrid
const ClientDotGrid: React.FC<DotGridProps> = (props) => {
  return <DynamicDotGrid {...props} />;
};

export default ClientDotGrid;
