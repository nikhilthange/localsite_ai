import { motion } from 'framer-motion';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import Features from './Features';
import Services from './Services';
import Stats from './Stats';
import Portfolio from './Portfolio';
import Pricing from './Pricing';
import Gallery from './Gallery';
import Testimonials from './Testimonials';
import Process from './Process';
import Team from './Team';
import FAQ from './FAQ';
import CTA from './CTA';
import Contact from './Contact';
import Newsletter from './Newsletter';
import MapSection from './Map';
import Footer from './Footer';

const SECTION_COMPONENTS = {
  announcement: AnnouncementBar,
  navbar: Navbar,
  hero: Hero,
  about: About,
  features: Features,
  services: Services,
  stats: Stats,
  portfolio: Portfolio,
  pricing: Pricing,
  gallery: Gallery,
  testimonials: Testimonials,
  process: Process,
  team: Team,
  faq: FAQ,
  cta: CTA,
  contact: Contact,
  newsletter: Newsletter,
  map: MapSection,
  footer: Footer,
};

const SECTION_ANIMATIONS = {
  'fade-up': {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
  'slide-up': {
    initial: { opacity: 0, y: 80 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  'parallax': {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.8, ease: [0.12, 0, 0.39, 0] },
  },
  'fade-in': {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.8, ease: 'easeOut' },
  },
  'scale-in': {
    initial: { opacity: 0, scale: 0.95 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function SectionRenderer({ website }) {
  const sections = website?.sections || [];
  const branding = website?.branding || {};

  const sortedSections = [...sections]
    .filter(s => s.visible !== false)
    .sort((a, b) => a.order - b.order);

  return sortedSections.map((section) => {
    const SectionComponent = SECTION_COMPONENTS[section.type];
    if (!SectionComponent) return null;

    const sectionAnim = SECTION_ANIMATIONS[section.animation || branding?.animations?.section] || SECTION_ANIMATIONS['fade-up'];
    const isStatic = section.type === 'navbar' || section.type === 'announcement' || section.type === 'footer';

    const props = {
      content: section.data || {},
      branding,
      section,
      background: section.background,
      category: website.category,
    };

    if (isStatic) {
      return (
        <div key={section.id || `${section.type}-${section.order}`}>
          <SectionComponent {...props} />
        </div>
      );
    }

    return (
      <motion.section
        key={section.id || `${section.type}-${section.order}`}
        id={section.type}
        {...sectionAnim}
      >
        <SectionComponent {...props} />
      </motion.section>
    );
  });
}

export default SectionRenderer;
