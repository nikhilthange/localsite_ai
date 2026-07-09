import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiX } from 'react-icons/hi';

export default function Gallery({ content = {}, branding = {} }) {
  const { title, description, images = [], layout = 'grid' } = content;
  const [lightbox, setLightbox] = useState(null);
  const colors = branding.colors || {};

  if (images.length === 0) return null;

  const isMasonry = layout === 'masonry';

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
        <div className={`grid gap-4 ${isMasonry ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
          {images.slice(0, 8).map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setLightbox(img)}
              className={`relative overflow-hidden rounded-xl cursor-pointer group ${isMasonry ? (i % 3 === 1 ? 'row-span-2' : '') : ''}`}
              style={{ aspectRatio: isMasonry ? 'auto' : '1' }}
            >
              <img src={img.src} alt={img.alt || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60">
                  {img.caption}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 p-2 text-white/80 hover:text-white">
            <HiX className="w-8 h-8" />
          </button>
          <img src={lightbox.src} alt={lightbox.alt || ''} className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
}
