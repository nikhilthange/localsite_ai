import { useContext } from 'react';
import { GrowthContext } from '@/context/GrowthContext';

export function useGrowth() {
  const ctx = useContext(GrowthContext);
  if (!ctx) throw new Error('useGrowth must be used within GrowthProvider');
  return ctx;
}
