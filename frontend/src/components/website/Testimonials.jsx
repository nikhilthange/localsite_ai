import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiStar, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <HiStar key={star} className={`w-4 h-4 ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  );
}

function CarouselLayout({ items, colors }) {
  const [current, setCurrent] = useState(0);
  if (items.length === 0) return null;

  const t = items[current];
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="mb-8">
        <img src={t.avatar} alt={t.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover ring-4" style={{ ringColor: colors.primary }} />
        <StarRating rating={t.rating} />
      </div>
      <p className="text-lg md:text-xl leading-relaxed mb-6 italic" style={{ color: colors.text }}>"{t.content}"</p>
      <div>
        <p className="font-semibold" style={{ color: colors.text }}>{t.name}</p>
        <p className="text-sm" style={{ color: colors.textSecondary }}>{t.role}{t.company ? `, ${t.company}` : ''}</p>
      </div>
      {items.length > 1 && (
        <div className="flex justify-center gap-3 mt-8">
          <button onClick={() => setCurrent(c => (c - 1 + items.length) % items.length)}
            className="p-2 rounded-full transition-colors hover:bg-gray-100" style={{ color: colors.text }}
          ><HiChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => setCurrent(c => (c + 1) % items.length)}
            className="p-2 rounded-full transition-colors hover:bg-gray-100" style={{ color: colors.text }}
          ><HiChevronRight className="w-5 h-5" /></button>
        </div>
      )}
    </div>
  );
}

function GridLayout({ items, colors, columns }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns || 2} gap-6`}>
      {items.map((t, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="p-6 md:p-8 rounded-2xl border"
          style={{ backgroundColor: colors.surface || '#FFFFFF', borderColor: colors.border || '#E4E4E7' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" loading="lazy" />
            <div>
              <p className="font-semibold text-sm" style={{ color: colors.text }}>{t.name}</p>
              <p className="text-xs" style={{ color: colors.textSecondary }}>{t.role}</p>
            </div>
            <div className="ml-auto"><StarRating rating={t.rating} /></div>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>"{t.content}"</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function Testimonials({ content = {}, branding = {} }) {
  const { title, description, items = [], layout = 'carousel' } = content;
  const colors = branding.colors || {};

  if (items.length === 0) return null;

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
        {layout === 'carousel' || layout === 'single-featured'
          ? <CarouselLayout items={items} colors={colors} />
          : <GridLayout items={items} colors={colors} columns={layout === 'grid-2' ? 2 : 3} />
        }
      </div>
    </section>
  );
}
