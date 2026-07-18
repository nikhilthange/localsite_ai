import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';

function AccordionItem({ item, isOpen, onClick, colors, index }) {
  return (
    <div className="border-b last:border-b-0 transition-colors" style={{ borderColor: colors.border || '#E4E4E7', backgroundColor: isOpen ? `${colors.primary}03` : 'transparent' }}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 md:py-6 px-2 text-left gap-4"
      >
        <span className="flex items-start gap-3">
          <span className="text-sm font-bold mt-0.5 shrink-0" style={{ color: colors.primary }}>0{index + 1}</span>
          <span className="font-medium text-sm md:text-base leading-relaxed" style={{ color: colors.text }}>{item.question}</span>
        </span>
        <HiChevronDown
          className={`w-5 h-5 shrink-0 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: isOpen ? colors.primary : colors.textSecondary }}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-6 px-2 pl-12 text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ({ content = {}, branding = {} }) {
  const { title, description, items = [] } = content;
  const [openIndex, setOpenIndex] = useState(null);
  const colors = branding.colors || {};

  if (items.length === 0) return null;

  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: colors.surfaceAlt || '#F4F4F5' }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-14"
          >
            {title && <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: colors.text }}>{title}</h2>}
            {description && <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: colors.textSecondary }}>{description}</p>}
          </motion.div>
        )}
        <div className="rounded-2xl border px-6 md:px-8 shadow-sm hover:shadow-md transition-shadow duration-300" style={{ backgroundColor: colors.surface || '#FFFFFF', borderColor: colors.border || '#E4E4E7' }}>
          {items.map((item, i) => (
            <AccordionItem key={i} item={item} isOpen={openIndex === i} onClick={() => setOpenIndex(openIndex === i ? null : i)} colors={colors} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
