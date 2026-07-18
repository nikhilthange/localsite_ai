import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';

export default function Gallery({ content = {}, branding = {} }) {
  const { title, description, images = [], layout = 'grid' } = content;
  const [lightbox, setLightbox] = useState(null);
  const colors = branding.colors || {};

  if (images.length === 0) return null;

  const isMasonry = layout === 'masonry';

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: colors.surfaceAlt || '#F4F4F5' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14"
          >
            {title && <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: colors.text }}>{title}</h2>}
            {description && <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: colors.textSecondary }}>{description}</p>}
          </motion.div>
        )}
          <div className={`grid gap-4 md:gap-6 ${isMasonry ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
          {images.slice(0, 8).map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setLightbox(img)}
              className={`relative overflow-hidden rounded-2xl cursor-pointer group shadow-md hover:shadow-xl transition-all duration-500 ${isMasonry ? (i % 3 === 1 ? 'sm:row-span-2' : '') : ''}`}
              style={{ aspectRatio: isMasonry ? 'auto' : '1' }}
            >
              <img src={img.src} alt={img.alt || ''} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500" />
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                  {img.caption}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          >
            <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition-colors z-10">
              <HiX className="w-8 h-8" />
            </button>
            <motion.img
              key={lightbox.src}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={lightbox.src}
              alt={lightbox.alt || ''}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
