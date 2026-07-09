import { createContext, useState, useCallback, useRef, useEffect } from 'react';
import { growthService } from '@/services/growthService';
import toast from 'react-hot-toast';

export const GrowthContext = createContext(null);

export function GrowthProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await growthService.getDashboard();
      if (mountedRef.current) setDashboard(data.data);
      return data.data;
    } catch (err) {
      if (mountedRef.current) toast.error('Failed to load dashboard');
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const fetchReports = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await growthService.getReports(params);
      if (mountedRef.current) setReports(data.data || []);
      return data;
    } catch (err) {
      if (mountedRef.current) toast.error('Failed to load reports');
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (websiteId) => {
    try {
      const { data } = await growthService.generateReport(websiteId);
      toast.success('Report generated!');
      return data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report');
      return null;
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      const { data } = await growthService.getInsights();
      if (mountedRef.current) setInsights(data.data || []);
      return data;
    } catch (err) {
      if (mountedRef.current) toast.error('Failed to load insights');
      return null;
    }
  }, []);

  const markInsightRead = useCallback(async (id) => {
    try {
      await growthService.markInsightRead(id);
      setInsights((prev) => prev.map((i) => (i._id === id ? { ...i, read: true } : i)));
    } catch {
      // silent
    }
  }, []);

  const dismissInsight = useCallback(async (id) => {
    try {
      await growthService.dismissInsight(id);
      setInsights((prev) => prev.filter((i) => i._id !== id));
    } catch {
      // silent
    }
  }, []);

  const value = {
    dashboard,
    reports,
    insights,
    loading,
    fetchDashboard,
    fetchReports,
    generateReport,
    fetchInsights,
    markInsightRead,
    dismissInsight,
  };

  return (
    <GrowthContext.Provider value={value}>
      {children}
    </GrowthContext.Provider>
  );
}
