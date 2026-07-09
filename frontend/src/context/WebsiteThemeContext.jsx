import { createContext, useContext, useMemo } from 'react';

const THEMES = {
  modern: {
    primary: '#6366f1',
    secondary: '#14b8a6',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: '0.75rem',
    shadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
    gradient: 'from-indigo-500 to-purple-600',
  },
  luxury: {
    primary: '#b8860b',
    secondary: '#8b4513',
    accent: '#d4af37',
    background: '#faf8f5',
    surface: '#f5f0eb',
    text: '#1a1410',
    textSecondary: '#7a6b5d',
    headingFont: 'Playfair Display',
    bodyFont: 'Lora',
    borderRadius: '0.375rem',
    shadow: '0 4px 20px rgba(139,69,19,0.08), 0 1px 3px rgba(0,0,0,0.04)',
    gradient: 'from-amber-700 to-yellow-600',
  },
  minimal: {
    primary: '#18181b',
    secondary: '#52525b',
    accent: '#a1a1aa',
    background: '#fafafa',
    surface: '#f4f4f5',
    text: '#09090b',
    textSecondary: '#71717a',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: '0.25rem',
    shadow: '0 1px 2px rgba(0,0,0,0.04)',
    gradient: 'from-zinc-800 to-zinc-700',
  },
  dark: {
    primary: '#8b5cf6',
    secondary: '#06b6d4',
    accent: '#f97316',
    background: '#0f111a',
    surface: '#1a1d2e',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: '0.75rem',
    shadow: '0 4px 20px rgba(0,0,0,0.3)',
    gradient: 'from-violet-600 to-cyan-500',
  },
  corporate: {
    primary: '#2563eb',
    secondary: '#059669',
    accent: '#d97706',
    background: '#ffffff',
    surface: '#f1f5f9',
    text: '#0f172a',
    textSecondary: '#475569',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: '0.375rem',
    shadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    gradient: 'from-blue-600 to-blue-800',
  },
  creative: {
    primary: '#ec4899',
    secondary: '#8b5cf6',
    accent: '#f43f5e',
    background: '#fffdfa',
    surface: '#fdf2f8',
    text: '#1a0a18',
    textSecondary: '#7c3a6a',
    headingFont: 'DM Sans',
    bodyFont: 'Inter',
    borderRadius: '1rem',
    shadow: '0 4px 25px rgba(236,72,153,0.1)',
    gradient: 'from-pink-500 to-violet-600',
  },
  elegant: {
    primary: '#1e293b',
    secondary: '#475569',
    accent: '#cbd5e1',
    background: '#f8fafc',
    surface: '#f1f5f9',
    text: '#020617',
    textSecondary: '#64748b',
    headingFont: 'Playfair Display',
    bodyFont: 'Lora',
    borderRadius: '0.5rem',
    shadow: '0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)',
    gradient: 'from-slate-800 to-slate-900',
  },
  glassmorphism: {
    primary: '#6366f1',
    secondary: '#a78bfa',
    accent: '#34d399',
    background: '#0a0a1a',
    surface: 'rgba(255,255,255,0.08)',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: '1.25rem',
    shadow: '0 8px 32px rgba(0,0,0,0.3)',
    gradient: 'from-indigo-500/30 to-purple-500/30',
  },
  gradient: {
    primary: '#f43f5e',
    secondary: '#3b82f6',
    accent: '#10b981',
    background: '#020617',
    surface: '#0f172a',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: '0.75rem',
    shadow: '0 4px 30px rgba(244,63,94,0.15)',
    gradient: 'from-rose-600 to-blue-600',
  },
  premium: {
    primary: '#fbbf24',
    secondary: '#f59e0b',
    accent: '#92400e',
    background: '#0a0a0a',
    surface: '#18181b',
    text: '#fafafa',
    textSecondary: '#a1a1aa',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    borderRadius: '0.625rem',
    shadow: '0 4px 24px rgba(251,191,36,0.08), 0 0 0 1px rgba(251,191,36,0.06)',
    gradient: 'from-amber-400 to-yellow-500',
  },
};

const INDUSTRY_DEFAULT_THEMES = {
  'Restaurant & Cafe': 'luxury',
  'Portfolio': 'creative',
  'E-Commerce': 'modern',
  'SaaS / Tech': 'corporate',
  'Local Business': 'modern',
  'Agency': 'creative',
  'Blog': 'minimal',
  'Real Estate': 'corporate',
  'Fitness': 'gradient',
  'Education': 'elegant',
  'Healthcare': 'elegant',
  'Creative': 'creative',
};

const themeKeys = Object.keys(THEMES);

const WebsiteThemeContext = createContext({
  theme: THEMES.modern,
  themeName: 'modern',
  allThemes: THEMES,
  themeKeys,
});

export function WebsiteThemeProvider({ industry, theme: themeName, children }) {
  const resolvedTheme = useMemo(() => {
    const name = themeName || INDUSTRY_DEFAULT_THEMES[industry] || 'modern';
    return THEMES[name] || THEMES.modern;
  }, [industry, themeName]);

  const value = useMemo(() => ({
    theme: resolvedTheme,
    themeName: themeName || INDUSTRY_DEFAULT_THEMES[industry] || 'modern',
    allThemes: THEMES,
    themeKeys,
  }), [resolvedTheme, themeName, industry]);

  return (
    <WebsiteThemeContext.Provider value={value}>
      <div
        style={{
          '--preview-primary': resolvedTheme.primary,
          '--preview-secondary': resolvedTheme.secondary,
          '--preview-accent': resolvedTheme.accent,
          '--preview-background': resolvedTheme.background,
          '--preview-surface': resolvedTheme.surface,
          '--preview-text': resolvedTheme.text,
          '--preview-text-secondary': resolvedTheme.textSecondary,
          '--preview-radius': resolvedTheme.borderRadius,
          '--preview-shadow': resolvedTheme.shadow,
          fontFamily: `'${resolvedTheme.headingFont}', 'Inter', sans-serif`,
        }}
        className="website-preview-root"
      >
        {children}
      </div>
    </WebsiteThemeContext.Provider>
  );
}

export function useWebsiteTheme() {
  const ctx = useContext(WebsiteThemeContext);
  if (!ctx) {
    return {
      theme: THEMES.modern,
      themeName: 'modern',
      allThemes: THEMES,
      themeKeys,
    };
  }
  return ctx;
}

export { THEMES, INDUSTRY_DEFAULT_THEMES };