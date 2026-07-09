import { createContext, useState, useCallback } from 'react';
import { websiteService } from '@/services/websiteService';
import toast from 'react-hot-toast';

export const WebsiteContext = createContext(null);

export function WebsiteProvider({ children }) {
  const [websites, setWebsites] = useState([]);
  const [currentWebsite, setCurrentWebsite] = useState(null);
  const [loading, setLoading] = useState(false);

  const normalizeWebsites = useCallback((data) => {
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (data?.websites && Array.isArray(data.websites)) return data.websites;
    return [];
  }, []);

  const fetchWebsites = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await websiteService.getWebsites();
      setWebsites(normalizeWebsites(data.data || data));
    } catch (err) {
      toast.error('Failed to fetch websites');
    } finally {
      setLoading(false);
    }
  }, [normalizeWebsites]);

  const createWebsite = useCallback(async (websiteData) => {
    setLoading(true);
    try {
      const { data } = await websiteService.generateWebsite(websiteData);
      toast.success('Website created successfully!');
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create website');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWebsite = useCallback(async (id, updates) => {
    try {
      const { data } = await websiteService.updateWebsite(id, updates);
      setWebsites((prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((w) => (w._id === id || w.id === id ? data.website || data.data || data : w));
      });
      toast.success('Website updated');
      return data;
    } catch (err) {
      toast.error('Failed to update website');
      throw err;
    }
  }, []);

  const deleteWebsite = useCallback(async (id) => {
    try {
      await websiteService.deleteWebsite(id);
      setWebsites((prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.filter((w) => w._id !== id && w.id !== id);
      });
      toast.success('Website deleted');
    } catch (err) {
      toast.error('Failed to delete website');
      throw err;
    }
  }, []);

  const value = {
    websites,
    setWebsites,
    currentWebsite,
    setCurrentWebsite,
    loading,
    fetchWebsites,
    createWebsite,
    updateWebsite,
    deleteWebsite,
  };

  return (
    <WebsiteContext.Provider value={value}>
      {children}
    </WebsiteContext.Provider>
  );
}
