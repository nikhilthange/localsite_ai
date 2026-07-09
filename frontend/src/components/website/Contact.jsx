import { motion } from 'framer-motion';
import { HiPhone, HiMail, HiLocationMarker, HiExternalLink } from 'react-icons/hi';

export default function Contact({ content = {}, branding = {} }) {
  const { title, description, phone, email, address, mapUrl, socialLinks = [], formFields = [] } = content;
  const colors = branding.colors || {};
  const primaryColor = colors.primary || '#6366F1';

  if (!phone && !email && !address && formFields.length === 0) return null;

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: colors.background || '#FAFAFA' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.text }}>{title}</h2>}
            {description && <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>{description}</p>}
          </motion.div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="space-y-6">
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor + '15' }}>
                    <HiPhone className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{phone}</p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>Call us</p>
                  </div>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: primaryColor + '15' }}>
                    <HiMail className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{email}</p>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>Email us</p>
                  </div>
                </a>
              )}
              {address && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: primaryColor + '15' }}>
                    <HiLocationMarker className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{address}</p>
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-xs inline-flex items-center gap-1 hover:underline" style={{ color: primaryColor }}>
                        View on map <HiExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              {socialLinks.length > 0 && (
                <div className="flex gap-3 pt-4">
                  {socialLinks.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      style={{ backgroundColor: primaryColor + '15', color: primaryColor }}
                    >
                      <span className="text-xs font-medium">{link.platform[0]}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
          {formFields.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {formFields.map((field, i) => (
                  <div key={i}>
                    {field.type === 'textarea' ? (
                      <textarea
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.border || '#E4E4E7', backgroundColor: colors.surface || '#FFFFFF', color: colors.text }}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ borderColor: colors.border || '#E4E4E7', backgroundColor: colors.surface || '#FFFFFF', color: colors.text }}
                      />
                    )}
                  </div>
                ))}
                <button type="submit"
                  className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >Send Message</button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
