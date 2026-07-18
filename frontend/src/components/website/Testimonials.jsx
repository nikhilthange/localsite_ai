import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="max-w-3xl mx-auto text-center relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <div className="relative inline-block">
              <img src={t.avatar} alt={t.name} className="w-24 h-24 rounded-full mx-auto mb-5 object-cover ring-4 ring-offset-4" style={{ ringColor: colors.primary, backgroundColor: colors.surface }} />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-white rounded-full" />
            </div>
            <StarRating rating={t.rating} />
          </div>
          <p className="text-xl md:text-2xl leading-relaxed mb-8 font-medium" style={{ color: colors.text }}>
            &ldquo;{t.content}&rdquo;
          </p>
          <div>
            <p className="font-semibold text-lg" style={{ color: colors.text }}>{t.name}</p>
            <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{t.role}{t.company ? `, ${t.company}` : ''}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button onClick={() => setCurrent(c => (c - 1 + items.length) % items.length)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border hover:scale-105"
            style={{ color: colors.text, borderColor: colors.border || '#E4E4E7', backgroundColor: colors.surface }}
          ><HiChevronLeft className="w-5 h-5" /></button>
          <div className="flex gap-2">
            {items.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i === current ? colors.primary : `${colors.border || '#E4E4E7'}`,
                  width: i === current ? 24 : 8,
                }}
              />
            ))}
          </div>
          <button onClick={() => setCurrent(c => (c + 1) % items.length)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border hover:scale-105"
            style={{ color: colors.text, borderColor: colors.border || '#E4E4E7', backgroundColor: colors.surface }}
          ><HiChevronRight className="w-5 h-5" /></button>
        </div>
      )}
    </div>
  );
}

function GridLayout({ items, colors, columns }) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
  }[columns] || 'md:grid-cols-2';

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-6 md:gap-8`}>
      {items.map((t, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="group p-6 md:p-8 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          style={{ backgroundColor: colors.surface || '#FFFFFF', borderColor: colors.border || '#E4E4E7' }}
        >
          <div className="flex items-start gap-4 mb-5">
            <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-full object-cover ring-2" style={{ ringColor: colors.primary }} loading="lazy" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold" style={{ color: colors.text }}>{t.name}</p>
              <p className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>{t.role}</p>
            </div>
            <StarRating rating={t.rating} />
          </div>
          <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
            &ldquo;{t.content}&rdquo;
          </p>
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
        {layout === 'carousel' || layout === 'single-featured'
          ? <CarouselLayout items={items} colors={colors} />
          : <GridLayout items={items} colors={colors} columns={layout === 'grid-2' ? 2 : 3} />
        }
      </div>
    </section>
  );
}
