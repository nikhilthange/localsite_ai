import { createContext, useState, useCallback, useRef, useEffect } from 'react';
import { websiteService } from '@/services/websiteService';
import toast from 'react-hot-toast';

export const WebsiteContext = createContext(null);

export function WebsiteProvider({ children }) {
  const [websites, setWebsites] = useState([]);
  const [currentWebsite, setCurrentWebsite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

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
      if (mountedRef.current) {
        setWebsites(normalizeWebsites(data.data || data));
      }
    } catch (err) {
      if (mountedRef.current) {
        toast.error('Failed to fetch websites');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [normalizeWebsites]);

  const generateWebsite = useCallback(async (websiteData) => {
    setGenerating(true);
    setLoading(true);
    try {
      const payload = {
        businessName: websiteData.businessName || websiteData.name,
        category: websiteData.category,
      };
      if (websiteData.location) payload.location = websiteData.location;
      if (websiteData.description) payload.description = websiteData.description;
      if (websiteData.phone) payload.phone = websiteData.phone;
      if (websiteData.email) payload.email = websiteData.email;
      if (websiteData.theme) payload.theme = websiteData.theme;
      const { data } = await websiteService.generateComplete(payload);
      const website = data?.website || data?.data || data;
      if (mountedRef.current) {
        setCurrentWebsite(website);
      }
      toast.success('Website generated successfully!');
      return website;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate website';
      toast.error(msg);
      throw err;
    } finally {
      if (mountedRef.current) {
        setGenerating(false);
        setLoading(false);
      }
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
    generating,
    fetchWebsites,
    generateWebsite,
    updateWebsite,
    deleteWebsite,
  };

  return (
    <WebsiteContext.Provider value={value}>
      {children}
    </WebsiteContext.Provider>
  );
}
