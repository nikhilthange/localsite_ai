import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { websiteService } from '../services/websiteService';

function trackPageView(path) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', import.meta.env.VITE_GA_ID, {
      page_path: path,
    });
  }
}

function trackEvent(action, category, label, value) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
}

function useWebsiteAnalytics(websiteId) {
  return useQuery({
    queryKey: ['websiteAnalytics', websiteId],
    queryFn: () => websiteService.getWebsiteAnalytics(websiteId),
    enabled: Boolean(websiteId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useAnalytics() {
  return {
    trackPageView: useCallback(trackPageView, []),
    trackEvent: useCallback(trackEvent, []),
    useWebsiteAnalytics,
  };
}
