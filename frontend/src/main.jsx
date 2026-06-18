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
                          borderRadius: '0.75rem',
                          padding: '0.75rem 1rem',
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
