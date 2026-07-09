import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';

function AccordionItem({ item, isOpen, onClick, colors }) {
  return (
    <div className="border-b" style={{ borderColor: colors.border || '#E4E4E7' }}>
      <button onClick={onClick} className="w-full flex items-center justify-between py-5 text-left">
        <span className="font-medium pr-4" style={{ color: colors.text }}>{item.question}</span>
        <HiChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{ color: colors.textSecondary }} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-sm leading-relaxed" style={{ color: colors.textSecondary }}>{item.answer}</p>
      </motion.div>
    </div>
  );
}

export default function FAQ({ content = {}, branding = {} }) {
  const { title, description, items = [] } = content;
  const [openIndex, setOpenIndex] = useState(null);
  const colors = branding.colors || {};

  if (items.length === 0) return null;

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: colors.surfaceAlt || '#F4F4F5' }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12"
          >
            {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.text }}>{title}</h2>}
            {description && <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textSecondary }}>{description}</p>}
          </motion.div>
        )}
        <div className="rounded-2xl border px-6" style={{ backgroundColor: colors.surface || '#FFFFFF', borderColor: colors.border || '#E4E4E7' }}>
          {items.map((item, i) => (
            <AccordionItem key={i} item={item} isOpen={openIndex === i} onClick={() => setOpenIndex(openIndex === i ? null : i)} colors={colors} />
          ))}
        </div>
      </div>
    </section>
  );
}
