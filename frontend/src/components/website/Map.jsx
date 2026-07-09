import { motion } from 'framer-motion';

export default function MapSection({ content = {}, branding = {} }) {
  const { title, address, lat, lng, zoom = 15 } = content;
  const colors = branding.colors || {};

  if (!address) return null;

  const mapSrc = lat && lng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.02}%2C${lng + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <section className="py-16" style={{ backgroundColor: colors.background || '#FAFAFA' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {title && (
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-center mb-8"
            style={{ color: colors.text }}
          >
            {title}
          </motion.h3>
        )}
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <iframe
            src={mapSrc}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title={address}
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}
