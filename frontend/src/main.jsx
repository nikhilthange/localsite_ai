import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { SocketProvider } from '@/hooks/useWebsocket';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { WebsiteProvider } from '@/context/WebsiteContext';
import { GrowthProvider } from '@/context/GrowthContext';
import App from '@/App';
import '@/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <SocketProvider>
          <AuthProvider>
            <ThemeProvider>
              <NotificationProvider>
                <WebsiteProvider>
                  <GrowthProvider>
                    <App />
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          borderRadius: '1rem',
                          padding: '0.75rem 1rem',
                          fontSize: '0.875rem',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)',
                        },
                        success: {
                          iconTheme: { primary: '#22c55e', secondary: '#fff' },
                        },
                        error: {
                          iconTheme: { primary: '#ef4444', secondary: '#fff' },
                        },
                      }}
                    />
                  </GrowthProvider>
                </WebsiteProvider>
              </NotificationProvider>
            </ThemeProvider>
          </AuthProvider>
          </SocketProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
