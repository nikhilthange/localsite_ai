export default function Footer({ content = {}, branding = {} }) {
  const { description, copyright, columns = [], socialLinks = [] } = content;
  const colors = branding.colors || {};

  return (
    <footer className="py-12 md:py-16" style={{ backgroundColor: colors.text || '#18181B' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-2 lg:col-span-1">
            {description && <p className="text-sm leading-relaxed opacity-80 mb-4" style={{ color: colors.textInverse || '#FFFFFF' }}>{description}</p>}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-all hover:opacity-70"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: colors.textInverse || '#FFFFFF' }}
                  >{link.platform[0]}</a>
                ))}
              </div>
            )}
          </div>
          {columns.map((col, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold mb-4" style={{ color: colors.textInverse || '#FFFFFF' }}>{col.title}</h4>
              <ul className="space-y-2.5">
                {(col.links || []).map((link, j) => (
                  <li key={j}>
                    <a href={link.href} className="text-sm opacity-70 hover:opacity-100 transition-opacity" style={{ color: colors.textInverse || '#FFFFFF' }}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <p className="text-sm text-center opacity-60" style={{ color: colors.textInverse || '#FFFFFF' }}>
            {copyright || `© ${new Date().getFullYear()}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
