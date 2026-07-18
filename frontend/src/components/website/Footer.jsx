import { motion } from 'framer-motion';

export default function Footer({ content = {}, branding = {} }) {
  const { description, copyright, columns = [], socialLinks = [] } = content;
  const colors = branding.colors || {};

  return (
    <footer className="py-16 md:py-20" style={{ backgroundColor: colors.text || '#18181B' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            {description && (
              <p className="text-sm leading-relaxed text-white/60 mb-6 max-w-xs">
                {description}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-medium text-white/80 transition-all duration-200 hover:scale-110 hover:opacity-100 hover:text-white"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  >{link.platform[0]}</a>
                ))}
              </div>
            )}
          </div>
          {columns.map((col, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-white mb-5 tracking-wide uppercase">{col.title}</h4>
              <ul className="space-y-3">
                {(col.links || []).map((link, j) => (
                  <li key={j}>
                    <a href={link.href}
                      className="text-sm text-white/50 transition-all duration-200 hover:text-white hover:translate-x-0.5 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/10">
          <p className="text-sm text-center text-white/40">
            {copyright || `© ${new Date().getFullYear()}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
