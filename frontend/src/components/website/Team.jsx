import { motion } from 'framer-motion';

export default function Team({ content = {}, branding = {} }) {
  const { title, description, members = [] } = content;
  const colors = branding.colors || {};

  if (members.length === 0) return null;

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: colors.background || '#FAFAFA' }}>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 ring-4 ring-transparent group-hover:ring-current transition-all duration-300" style={{ '--tw-ring-color': colors.primary || '#6366F1' }}>
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <h3 className="font-semibold text-lg" style={{ color: colors.text }}>{member.name}</h3>
              <p className="text-sm font-medium mb-2" style={{ color: colors.primary || '#6366F1' }}>{member.role}</p>
              {member.bio && <p className="text-sm" style={{ color: colors.textSecondary }}>{member.bio}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
