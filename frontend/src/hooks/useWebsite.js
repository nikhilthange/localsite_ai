import { useContext } from 'react';
import { WebsiteContext } from '@/context/WebsiteContext';

export function useWebsites() {
  const ctx = useContext(WebsiteContext);
  if (!ctx) throw new Error('useWebsites must be used within WebsiteProvider');
  return ctx;
}

export function useWebsite() {
  const ctx = useContext(WebsiteContext);
  if (!ctx) throw new Error('useWebsite must be used within WebsiteProvider');
  return ctx;
}
