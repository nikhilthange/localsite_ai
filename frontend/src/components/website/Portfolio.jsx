import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiExternalLink } from 'react-icons/hi';

export default function Portfolio({ content = {}, branding = {} }) {
  const { title, description, items = [], layout = 'grid' } = content;
  const colors = branding.colors || {};

  if (items.length === 0) return null;

  const isMasonry = layout === 'masonry';

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: colors.surfaceAlt || '#F4F4F5' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.text }}>{title}</h2>}
            {description && <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>{description}</p>}
          </motion.div>
        )}
        <div className={twMerge(
          'grid gap-6',
          isMasonry ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        )}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={twMerge(
                'group relative overflow-hidden rounded-2xl',
                isMasonry && i % 3 === 1 ? 'sm:row-span-2' : ''
              )}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div>
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">{item.category}</p>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm text-white/80 hover:text-white">
                      <HiExternalLink className="w-4 h-4" /> View Project
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
