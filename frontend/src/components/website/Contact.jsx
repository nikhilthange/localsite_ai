import { motion } from 'framer-motion';
import { HiPhone, HiMail, HiLocationMarker, HiExternalLink } from 'react-icons/hi';
import { HiPaperAirplane } from 'react-icons/hi';

export default function Contact({ content = {}, branding = {} }) {
  const { title, description, phone, email, address, mapUrl, socialLinks = [], formFields = [] } = content;
  const colors = branding.colors || {};
  const primaryColor = colors.primary || '#6366F1';

  if (!phone && !email && !address && formFields.length === 0) return null;

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: colors.background || '#FAFAFA' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14"
          >
            {title && <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: colors.text }}>{title}</h2>}
            {description && <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: colors.textSecondary }}>{description}</p>}
          </motion.div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="space-y-6">
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-5 group p-4 rounded-2xl transition-all duration-200 hover:bg-[var(--color-surface)]" style={{ backgroundColor: `${primaryColor}04` }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105" style={{ backgroundColor: primaryColor + '12' }}>
                    <HiPhone className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{phone}</p>
                    <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>Call us directly</p>
                  </div>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-5 group p-4 rounded-2xl transition-all duration-200 hover:bg-[var(--color-surface)]" style={{ backgroundColor: `${primaryColor}04` }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105" style={{ backgroundColor: primaryColor + '12' }}>
                    <HiMail className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{email}</p>
                    <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>Send us an email</p>
                  </div>
                </a>
              )}
              {address && (
                <div className="flex items-center gap-5 p-4 rounded-2xl" style={{ backgroundColor: `${primaryColor}04` }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: primaryColor + '12' }}>
                    <HiLocationMarker className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{address}</p>
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-xs inline-flex items-center gap-1 mt-0.5 hover:underline" style={{ color: primaryColor }}>
                        View on map <HiExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              {socialLinks.length > 0 && (
                <div className="flex gap-3 pt-2">
                  {socialLinks.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg"
                      style={{ backgroundColor: primaryColor + '12', color: primaryColor }}
                    >
                      <span className="text-sm font-bold">{link.platform[0].toUpperCase()}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
          {formFields.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="p-6 md:p-8 rounded-2xl border shadow-sm" style={{ backgroundColor: colors.surface || '#FFFFFF', borderColor: colors.border || '#E4E4E7' }}
            >
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                {formFields.map((field, i) => (
                  <div key={i}>
                    {field.label && (
                      <label className="block text-sm font-medium mb-1.5" style={{ color: colors.text }}>{field.label}</label>
                    )}
                    {field.type === 'textarea' ? (
                      <textarea
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all resize-none"
                        style={{ borderColor: colors.border || '#E4E4E7', backgroundColor: colors.background || '#FAFAFA', color: colors.text }}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.border || '#E4E4E7', backgroundColor: colors.background || '#FAFAFA', color: colors.text }}
                      />
                    )}
                  </div>
                ))}
                <button type="submit"
                  className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  Send Message <HiPaperAirplane className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
