import { createContext, useContext, useState, useCallback } from 'react';
import { growthService } from '@/services/growthService';
import toast from 'react-hot-toast';

const GrowthContext = createContext(null);

export function useGrowth() {
  const ctx = useContext(GrowthContext);
  if (!ctx) throw new Error('useGrowth must be used within GrowthProvider');
  return ctx;
}

export function GrowthProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await growthService.getDashboard();
      setDashboard(data.data);
      return data.data;
    } catch (err) {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReports = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await growthService.getReports(params);
      setReports(data.data || []);
      return data;
    } catch (err) {
      toast.error('Failed to load reports');
      return null;
    } finally {
      setLoading(false);
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
      setInsights(data.data || []);
      return data;
    } catch (err) {
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
