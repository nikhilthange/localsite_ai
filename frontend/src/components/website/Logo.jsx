import { motion } from 'framer-motion';
import {
  HiHeart, HiOfficeBuilding, HiAcademicCap, HiCamera, HiHome,
  HiGlobe, HiLightningBolt, HiScissors, HiCube, HiSun,
  HiTruck, HiLibrary, HiClipboardList, HiSparkles, HiMenu,
} from 'react-icons/hi';

const industryMap = {
  'restaurant & cafe': { icon: HiHeart, gradient: 'from-rose-500 to-orange-500', font: 'font-serif italic tracking-wide', size: 'text-2xl md:text-3xl' },
  'restaurant': { icon: HiHeart, gradient: 'from-rose-500 to-orange-500', font: 'font-serif italic tracking-wide', size: 'text-2xl md:text-3xl' },
  'gym/fitness': { icon: HiLightningBolt, gradient: 'from-red-500 to-orange-500', font: 'font-extrabold tracking-tight uppercase', size: 'text-2xl md:text-3xl' },
  'gym': { icon: HiLightningBolt, gradient: 'from-red-500 to-orange-500', font: 'font-extrabold tracking-tight uppercase', size: 'text-2xl md:text-3xl' },
  'salon/spa': { icon: HiScissors, gradient: 'from-pink-400 to-purple-500', font: 'font-serif tracking-wider', size: 'text-xl md:text-2xl' },
  'salon': { icon: HiScissors, gradient: 'from-pink-400 to-purple-500', font: 'font-serif tracking-wider', size: 'text-xl md:text-2xl' },
  'hospital/clinic': { icon: HiOfficeBuilding, gradient: 'from-blue-500 to-cyan-500', font: 'font-sans font-light tracking-wide', size: 'text-xl md:text-2xl' },
  'hospital': { icon: HiOfficeBuilding, gradient: 'from-blue-500 to-cyan-500', font: 'font-sans font-light tracking-wide', size: 'text-xl md:text-2xl' },
  'law firm': { icon: HiLibrary, gradient: 'from-slate-700 to-blue-800', font: 'font-serif tracking-wider uppercase', size: 'text-xl md:text-2xl' },
  'law': { icon: HiLibrary, gradient: 'from-slate-700 to-blue-800', font: 'font-serif tracking-wider uppercase', size: 'text-xl md:text-2xl' },
  'construction': { icon: HiTruck, gradient: 'from-amber-500 to-orange-600', font: 'font-bold uppercase tracking-widest', size: 'text-xl md:text-2xl' },
  'interior design': { icon: HiCube, gradient: 'from-violet-500 to-fuchsia-500', font: 'font-light tracking-wide', size: 'text-2xl md:text-3xl' },
  'design': { icon: HiCube, gradient: 'from-violet-500 to-fuchsia-500', font: 'font-light tracking-wide', size: 'text-2xl md:text-3xl' },
  'photography': { icon: HiCamera, gradient: 'from-gray-800 to-gray-600', font: 'font-light uppercase tracking-[0.2em]', size: 'text-xl md:text-2xl' },
  'hotel': { icon: HiSun, gradient: 'from-amber-400 to-yellow-600', font: 'font-serif tracking-wide', size: 'text-2xl md:text-3xl' },
  'travel': { icon: HiGlobe, gradient: 'from-sky-400 to-emerald-500', font: 'font-bold tracking-wide', size: 'text-xl md:text-2xl' },
  'real estate': { icon: HiHome, gradient: 'from-blue-600 to-indigo-700', font: 'font-bold tracking-tight', size: 'text-2xl md:text-3xl' },
  'school/education': { icon: HiAcademicCap, gradient: 'from-emerald-500 to-teal-600', font: 'font-bold tracking-wide', size: 'text-xl md:text-2xl' },
  'school': { icon: HiAcademicCap, gradient: 'from-emerald-500 to-teal-600', font: 'font-bold tracking-wide', size: 'text-xl md:text-2xl' },
  'coaching': { icon: HiSparkles, gradient: 'from-violet-600 to-pink-500', font: 'font-extrabold tracking-tight', size: 'text-2xl md:text-3xl' },
  'portfolio': { icon: HiClipboardList, gradient: 'from-gray-700 to-gray-900', font: 'font-light uppercase tracking-wider', size: 'text-xl md:text-2xl' },
};

function normalizeIndustry(industry) {
  if (!industry) return 'portfolio';
  const key = industry.toLowerCase().trim();
  if (industryMap[key]) return key;
  if (key.includes('restaurant') || key.includes('cafe') || key.includes('food')) return 'restaurant & cafe';
  if (key.includes('gym') || key.includes('fitness')) return 'gym/fitness';
  if (key.includes('salon') || key.includes('spa') || key.includes('beauty')) return 'salon/spa';
  if (key.includes('hospital') || key.includes('clinic') || key.includes('health') || key.includes('medical')) return 'hospital/clinic';
  if (key.includes('law') || key.includes('legal') || key.includes('attorney')) return 'law firm';
  if (key.includes('construction') || key.includes('contractor') || key.includes('builder')) return 'construction';
  if (key.includes('interior') || key.includes('design')) return 'interior design';
  if (key.includes('photo')) return 'photography';
  if (key.includes('hotel') || key.includes('lodging') || key.includes('resort')) return 'hotel';
  if (key.includes('travel') || key.includes('tour') || key.includes('vacation')) return 'travel';
  if (key.includes('real estate') || key.includes('property') || key.includes('realtor')) return 'real estate';
  if (key.includes('school') || key.includes('education') || key.includes('academy') || key.includes('learning')) return 'school/education';
  if (key.includes('coach') || key.includes('consulting') || key.includes('mentor')) return 'coaching';
  return 'portfolio';
}

export default function Logo({ businessName, industry, theme = {}, className = '', size = 'md', showIcon = true }) {
  const normalized = normalizeIndustry(industry);
  const config = industryMap[normalized] || industryMap.portfolio;
  const Icon = config.icon;
  const primaryColor = theme.primary || '#6366f1';

  const sizeClasses = {
    sm: 'text-lg md:text-xl',
    md: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-4xl',
    xl: 'text-3xl md:text-5xl',
  };

  return (
    <motion.div
      className={`inline-flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {showIcon && (
        <div
          className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br shrink-0"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
      <span
        className={`bg-gradient-to-r bg-clip-text text-transparent ${config.font} ${sizeClasses[size] || sizeClasses.md}`}
        style={{
          backgroundImage: `linear-gradient(to right, ${primaryColor}, ${primaryColor}cc)`,
        }}
      >
        {businessName || 'Business Name'}
      </span>
    </motion.div>
  );
}
