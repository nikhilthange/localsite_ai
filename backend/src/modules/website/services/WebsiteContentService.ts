import { AIEngineService } from '../../../modules/ai/services/AIEngineService';
import { AITaskType, AICompletionRequest } from '../../../modules/ai/types';
import { INDUSTRY_CONFIGS, INDUSTRY_IMAGE_MAP } from '../data/industries';
import { getTheme, THEMES } from '../data/themes';
import type { GeneratedContent, HeroContent, NavbarContent, AboutContent, ServiceItem, TestimonialItem, FaqItem, GalleryItem, ContactContent, FooterContent, HoursContent, SeoContent, IndustryConfig, ThemeConfig } from '../../../types/website';
import { Logger } from '../../../core/logging/Logger';
import { config } from '../../../config';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

function generateHours(industry: string): HoursContent {
  const hours: HoursContent = {};
  for (const day of DAYS) {
    if (day === 'sunday') {
      hours[day] = industry === 'hospital' || industry === 'clinic'
        ? { open: '09:00', close: '13:00' }
        : null;
    } else if (day === 'saturday') {
      hours[day] = industry === 'restaurant' || industry === 'cafe' || industry === 'hotel'
        ? { open: '09:00', close: '23:00' }
        : ['law-firm', 'school', 'coaching-institute'].includes(industry)
          ? { open: '09:00', close: '14:00' }
          : { open: '09:00', close: '18:00' };
    } else {
      hours[day] = { open: '09:00', close: '18:00' };
    }
  }
  return hours;
}

const INDUSTRY_SOCIAL_LINKS: Record<string, { platform: string; icon: string }[]> = {
  restaurant: [
    { platform: 'Instagram', icon: 'instagram' },
    { platform: 'Facebook', icon: 'facebook' },
    { platform: 'Zomato', icon: 'utensils' },
  ],
  cafe: [
    { platform: 'Instagram', icon: 'instagram' },
    { platform: 'Facebook', icon: 'facebook' },
  ],
  'real-estate': [
    { platform: 'Instagram', icon: 'instagram' },
    { platform: 'Facebook', icon: 'facebook' },
    { platform: 'LinkedIn', icon: 'linkedin' },
  ],
  photographer: [
    { platform: 'Instagram', icon: 'instagram' },
    { platform: 'Facebook', icon: 'facebook' },
    { platform: '500px', icon: 'camera' },
  ],
};

function getSocialLinks(industry: string): Array<{ platform: string; url: string; icon: string }> {
  const links = INDUSTRY_SOCIAL_LINKS[industry] || [
    { platform: 'Facebook', icon: 'facebook' },
    { platform: 'Instagram', icon: 'instagram' },
  ];
  return links.map(l => ({
    ...l,
    url: `https://${l.platform.toLowerCase()}.com/`,
  }));
}

function generateNavbarContent(industry: string, config: IndustryConfig): NavbarContent {
  const links: Array<{ label: string; href: string }> = [];
  if (config.sections.includes('hero')) links.push({ label: 'Home', href: '#home' });
  if (config.sections.includes('about')) links.push({ label: 'About', href: '#about' });
  if (config.sections.includes('services')) links.push({ label: 'Services', href: '#services' });
  if (config.sections.includes('gallery')) links.push({ label: 'Gallery', href: '#gallery' });
  if (config.sections.includes('testimonials')) links.push({ label: 'Testimonials', href: '#testimonials' });
  if (config.sections.includes('faq')) links.push({ label: 'FAQ', href: '#faq' });
  links.push({ label: 'Contact', href: '#contact' });

  const ctaText = industry === 'restaurant' || industry === 'cafe'
    ? 'Book a Table'
    : industry === 'gym'
      ? 'Start Free Trial'
      : industry === 'salon'
        ? 'Book Appointment'
        : industry === 'hospital' || industry === 'clinic'
          ? 'Schedule Visit'
          : industry === 'law-firm'
            ? 'Free Consultation'
            : industry === 'real-estate'
              ? 'Schedule Tour'
              : 'Get Started';

  return { links, cta: { text: ctaText, href: '#contact' } };
}

function generateFooterContent(businessName: string, location: string, industry: string): FooterContent {
  const industryDescriptions: Record<string, string> = {
    restaurant: `Experience the finest dining at ${businessName}. We are committed to delivering exceptional culinary experiences using the freshest ingredients, crafted with passion and served with warmth in the heart of ${location}.`,
    cafe: `${businessName} is your cozy neighborhood cafe in ${location}, serving artisanal coffee, fresh pastries, and wholesome meals in a warm and inviting atmosphere.`,
    gym: `Transform your fitness journey with ${businessName} in ${location}. Our state-of-the-art facility, expert trainers, and supportive community help you achieve your health and wellness goals.`,
    salon: `${businessName} is ${location}'s premier beauty destination, offering expert hair styling, skincare, and wellness services in a luxurious and relaxing environment.`,
    hospital: `${businessName} is a leading healthcare institution in ${location}, dedicated to providing compassionate, comprehensive medical care with cutting-edge technology and expert physicians.`,
    clinic: `${businessName} provides accessible, high-quality healthcare services to the ${location} community, with a focus on preventive care and personalized treatment plans.`,
    'law-firm': `${businessName} is a trusted law firm serving ${location} with exceptional legal expertise, personalized attention, and a steadfast commitment to protecting our clients' rights and interests.`,
    construction: `${businessName} is ${location}'s trusted construction partner, delivering excellence in residential and commercial building projects with quality craftsmanship and unwavering reliability.`,
    'interior-designer': `${businessName} transforms spaces into stunning environments that reflect your unique style. Based in ${location}, we blend creativity with functionality to create interiors you'll love.`,
    photographer: `${businessName} captures life's most precious moments with artistic vision and technical expertise. Based in ${location}, we specialize in creating timeless visual stories.`,
    hotel: `${businessName} offers an unparalleled hospitality experience in ${location}, combining luxury accommodations with exceptional service to create memorable stays for every guest.`,
    'travel-agency': `${businessName} is your gateway to extraordinary travel experiences. Based in ${location}, we curate personalized itineraries that turn your dream vacations into reality.`,
    'real-estate': `${businessName} is ${location}'s leading real estate agency, helping clients find their perfect property with expert guidance, market insight, and personalized service.`,
    school: `${businessName} is dedicated to nurturing young minds in ${location}, providing a holistic education that combines academic excellence with character development and creative exploration.`,
    'coaching-institute': `${businessName} empowers students in ${location} to achieve academic excellence through expert coaching, personalized mentorship, and proven teaching methodologies.`,
  };

  return {
    description: industryDescriptions[industry] || `${businessName} is a premier ${industry.replace('-', ' ')} service provider in ${location}, dedicated to excellence and customer satisfaction.`,
    copyright: `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
    links: [
      { label: 'Home', href: '#home' },
      { label: 'About', href: '#about' },
      { label: 'Services', href: '#services' },
      { label: 'Contact', href: '#contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  };
}

function generateContactContent(businessName: string, location: string, phone: string, email: string, industry: string): ContactContent {
  const city = location.split(',')[0].trim();
  const state = location.includes(',') ? location.split(',').pop()?.trim() || '' : '';
  const fullAddress = `${businessName}, ${city}${state ? ', ' + state : ''}`;

  const mapCity = encodeURIComponent(city);
  const mapQuery = encodeURIComponent(`${businessName} ${city}`);

  return {
    phone,
    email,
    address: fullAddress,
    mapUrl: `https://www.google.com/maps?q=${mapQuery}`,
    socialLinks: getSocialLinks(industry),
  };
}

function generateSeoContent(businessName: string, category: string, location: string, industryConfig: IndustryConfig): SeoContent {
  const industryLabel = category.replace(/-/g, ' ');
  const city = location.split(',')[0].trim();
  return {
    metaTitle: `${businessName} | Best ${industryLabel} in ${city}`,
    metaDescription: `${businessName} offers professional ${industryLabel} services in ${city}, ${location}. Contact us today for exceptional service and quality results.`,
    keywords: [businessName, industryLabel, city, location, ...industryConfig.imageKeywords],
  };
}

function generateStructuredData(content: GeneratedContent, industry: string, config: IndustryConfig): Record<string, any> {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: content.businessName,
    description: content.description,
    image: content.hero.backgroundImage,
    telephone: content.contact.phone,
    email: content.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: content.contact.address,
    },
    openingHoursSpecification: Object.entries(content.hours)
      .filter(([_, v]) => v !== null)
      .map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
        opens: (hours as { open: string; close: string }).open,
        closes: (hours as { open: string; close: string }).close,
      })),
    sameAs: content.contact.socialLinks.map(l => l.url),
  };

  if (content.testimonials.length > 0) {
    schema.review = content.testimonials.map(t => ({
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: t.rating },
      author: { '@type': 'Person', name: t.name },
      reviewBody: t.content,
    }));
  }

  const typeMap: Record<string, string> = {
    restaurant: 'Restaurant',
    cafe: 'CafeOrCoffeeShop',
    gym: 'HealthClub',
    salon: 'BeautySalon',
    hospital: 'Hospital',
    clinic: 'MedicalClinic',
    'law-firm': 'LegalService',
    construction: 'HomeAndConstructionBusiness',
    'interior-designer': 'InteriorDesignSolution',
    photographer: 'Photography',
    hotel: 'Hotel',
    'travel-agency': 'TravelAgency',
    'real-estate': 'RealEstateAgent',
    school: 'School',
    'coaching-institute': 'EducationalOrganization',
  };

  if (typeMap[industry]) {
    schema['@type'] = typeMap[industry];
  }

  if (config.hasMenu && (industry === 'restaurant' || industry === 'cafe')) {
    schema.hasMenu = `${content.businessName} Menu`;
    schema.servesCuisine = industry === 'restaurant' ? 'International' : 'Coffee';
  }

  return schema;
}

function generateHeroContent(businessName: string, category: string, location: string, config: IndustryConfig): HeroContent {
  const industryHeadlines: Record<string, { headline: string[]; subheadline: string[]; cta: string[] }> = {
    restaurant: {
      headline: [`Experience Exquisite Dining at ${businessName}`, `Discover the Flavors of ${businessName}`, `${businessName} – A Culinary Journey`],
      subheadline: [`Where every dish tells a story. Enjoy handcrafted cuisine made from the freshest local ingredients in ${location}.`, `Indulge in an unforgettable dining experience. ${businessName} brings you the finest culinary creations in ${location}.`],
      cta: ['Reserve Your Table', 'Explore Our Menu', 'Book Now'],
    },
    gym: {
      headline: [`Transform Your Body at ${businessName}`, `Unlock Your Potential at ${businessName}`, `Get Fit. Stay Strong. Join ${businessName}`],
      subheadline: [`${location}'s premier fitness destination with state-of-the-art equipment, expert trainers, and a motivating community.`, `Achieve your fitness goals with personalized training programs and a supportive environment at ${businessName}.`],
      cta: ['Start Your Journey', 'Claim Free Pass', 'Join Today'],
    },
  };

  const defaults = {
    headline: [`Welcome to ${businessName}`, `${businessName} – Excellence in ${category.replace('-', ' ')}`, `${businessName} – Your Trusted Partner in ${location}`],
    subheadline: [`${businessName} provides professional ${category.replace(/-/g, ' ')} services in ${location}. We are committed to delivering exceptional results with personalized attention.`, `Discover why ${businessName} is ${location}'s preferred choice for ${category.replace(/-/g, ' ')} services.`],
    cta: ['Get Started', 'Learn More', 'Contact Us'],
  };

  const data = industryHeadlines[category] || defaults;
  const heroImages = INDUSTRY_IMAGE_MAP[category]?.hero || [];

  return {
    headline: pick(data.headline),
    subheadline: pick(data.subheadline),
    ctaText: pick(data.cta),
    backgroundImage: heroImages[0] || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
  };
}

function generateAboutContent(businessName: string, category: string, location: string, config: IndustryConfig): AboutContent {
  const industryContent: Record<string, { title: string; paragraphs: string[]; stats: Array<{ value: string; label: string }> }> = {
    restaurant: {
      title: `Our Story`,
      paragraphs: [
        `Founded in the heart of ${location}, ${businessName} has been delighting guests with exceptional cuisine and warm hospitality. Our passionate team of chefs crafts each dish using the freshest locally-sourced ingredients, blending traditional techniques with innovative flavors to create an unforgettable dining experience.`,
        `At ${businessName}, we believe dining is more than just food — it's about creating memories. Our elegant ambiance, attentive service, and carefully curated wine list ensure every visit is special. Whether you're celebrating a milestone or enjoying a casual meal, we invite you to savor the moment with us.`,
        `From our kitchen to your table, every plate tells a story of dedication, quality, and love for the culinary arts. We take pride in being a beloved dining destination in ${location} and look forward to serving you.`,
      ],
      stats: [
        { value: '15+', label: 'Years of Excellence' },
        { value: '50K+', label: 'Happy Guests Served' },
        { value: '4.8', label: 'Guest Rating' },
      ],
    },
  };

  const generateGenericAbout = (businessName: string, category: string, location: string): { title: string; paragraphs: string[]; stats: Array<{ value: string; label: string }> } => ({
    title: `About ${businessName}`,
    paragraphs: [
      `${businessName} is a premier ${category.replace(/-/g, ' ')} provider based in ${location}, dedicated to delivering outstanding service and exceptional results. Our team brings years of experience, expertise, and a genuine passion for what we do, ensuring every client receives the highest standard of care and attention.`,
      `We understand that choosing the right ${category.replace(/-/g, ' ')} partner is an important decision. That's why we prioritize transparent communication, personalized solutions, and a commitment to excellence in everything we undertake. Our approach combines industry best practices with innovative thinking to deliver results that exceed expectations.`,
      `At ${businessName}, our clients are at the heart of everything we do. We build lasting relationships based on trust, integrity, and outstanding service. We invite you to experience the difference that true professionalism and dedication make.`,
    ],
    stats: [
      { value: '10+', label: 'Years Experience' },
      { value: '1000+', label: 'Happy Clients' },
      { value: '98%', label: 'Satisfaction Rate' },
    ],
  });

  const data = industryContent[category] || generateGenericAbout(businessName, category, location);
  const aboutImages = INDUSTRY_IMAGE_MAP[category]?.about || [];

  return {
    title: data.title,
    content: data.paragraphs.join('\n\n'),
    image: aboutImages[0] || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    stats: data.stats,
  };
}

function generateServices(businessName: string, category: string, config: IndustryConfig): ServiceItem[] {
  const industryServices: Record<string, ServiceItem[]> = {
    restaurant: [
      { title: 'Fine Dining Experience', description: 'Savor expertly crafted dishes in our elegant dining room, featuring seasonal menus curated by our award-winning chefs using the finest local ingredients.', icon: 'utensils-crossed', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', price: '$$$', features: ['Seasonal tasting menus', 'Wine pairing available', 'Private dining options'] },
      { title: 'Private Events & Catering', description: 'Celebrate life\'s special moments with us. Our dedicated events team ensures a flawless experience for weddings, corporate events, and private gatherings.', icon: 'party-popper', image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80', price: 'Custom', features: ['Event planning assistance', 'Customized menus', 'Full-service catering'] },
      { title: 'Chef\'s Table Experience', description: 'Enjoy an intimate culinary journey with a front-row seat to the kitchen action. Our chef presents a personalized multi-course tasting menu just for you.', icon: 'chef-hat', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80', price: '$$$$', features: ['Personalized menu', 'Chef interaction', 'Wine pairings included'] },
      { title: 'Bar & Lounge', description: 'Unwind in our sophisticated lounge with handcrafted cocktails, premium spirits, and a carefully curated selection of wines from around the world.', icon: 'wine', image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80', price: '$$', features: ['Signature cocktails', 'Extensive wine list', 'Live music weekends'] },
    ],
    gym: [
      { title: 'Personal Training', description: 'Achieve your fitness goals faster with one-on-one coaching from our certified personal trainers. Customized programs designed for your unique needs and objectives.', icon: 'dumbbell', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', price: 'From $49/session', features: ['Custom workout plans', 'Nutrition guidance', 'Progress tracking'] },
      { title: 'Group Fitness Classes', description: 'Stay motivated with our diverse range of group classes including yoga, HIIT, spinning, Zumba, and more. Led by energetic instructors in a supportive environment.', icon: 'users', image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80', price: 'Included', features: ['50+ classes weekly', 'All skill levels', 'Flexible schedule'] },
      { title: 'Strength & Conditioning', description: 'Build power and endurance in our fully equipped strength zone with top-of-the-line free weights, machines, and functional training equipment.', icon: 'weight', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', price: 'Included', features: ['Premium equipment', 'Dedicated lifting area', 'Coach supervision'] },
    ],
    salon: [
      { title: 'Hair Styling & Color', description: 'Transform your look with expert cuts, styling, and color services. Our stylists stay current with the latest trends and techniques to give you the perfect look.', icon: 'scissors', image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80', price: 'From $45', features: ['Precision cutting', 'Balayage & highlights', 'Keratin treatments'] },
      { title: 'Skincare & Facials', description: 'Rejuvenate your skin with our premium facial treatments, using medical-grade products and advanced techniques to restore your natural glow.', icon: 'sparkles', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80', price: 'From $75', features: ['Deep cleansing facials', 'Anti-aging treatments', 'Chemical peels'] },
      { title: 'Nail Services', description: 'Pamper your hands and feet with our comprehensive nail services, from classic manicures to intricate nail art designs.', icon: 'hand', image: 'https://images.unsplash.com/photo-1602271947327-57ebc2028637?w=800&q=80', price: 'From $25', features: ['Gel & acrylic', 'Nail art', 'Pedicure spa'] },
      { title: 'Massage Therapy', description: 'Relax and recharge with our therapeutic massage services, designed to relieve tension, improve circulation, and promote overall wellness.', icon: 'spa', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', price: 'From $65', features: ['Swedish & deep tissue', 'Hot stone therapy', 'Aromatherapy'] },
    ],
    'real-estate': [
      { title: 'Residential Sales', description: 'Find your dream home with our expert guidance. We represent buyers and sellers in residential transactions, ensuring smooth, successful deals from offer to closing.', icon: 'home', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80', features: ['Property listings', 'Market analysis', 'Negotiation expertise'] },
      { title: 'Property Management', description: 'Maximize your investment returns with our comprehensive property management services. We handle everything from tenant screening to maintenance.', icon: 'building', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', features: ['Tenant placement', 'Rent collection', '24/7 maintenance'] },
      { title: 'Commercial Real Estate', description: 'Expert guidance for commercial property investments, leases, and sales. We help businesses find the perfect space to grow and thrive.', icon: 'briefcase', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80', features: ['Office & retail space', 'Investment properties', 'Lease negotiation'] },
      { title: 'Real Estate Investment', description: 'Build wealth through strategic real estate investments. Our team identifies high-potential opportunities and guides you through the investment process.', icon: 'trending-up', image: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&q=80', features: ['Portfolio strategy', 'Market research', 'ROI analysis'] },
    ],
    photographer: [
      { title: 'Wedding Photography', description: 'Capture every precious moment of your special day with our artistic wedding photography. We tell your love story through timeless, beautiful images.', icon: 'heart', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', price: 'From $1,500', features: ['Full-day coverage', 'Engagement shoot', 'Fine art albums'] },
      { title: 'Portrait Photography', description: 'Professional portraits for individuals, families, and professionals. We create stunning images that capture your unique personality and style.', icon: 'camera', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', price: 'From $250', features: ['Studio & location', 'Professional editing', 'Digital gallery'] },
      { title: 'Commercial Photography', description: 'Elevate your brand with high-quality commercial photography. Product shots, corporate events, and brand imagery that makes an impact.', icon: 'briefcase', image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80', price: 'Custom quote', features: ['Product photography', 'Corporate events', 'Brand campaigns'] },
    ],
    hospital: [
      { title: 'Emergency Care', description: '24/7 emergency medical services with board-certified physicians and advanced diagnostic technology, ready to handle any medical emergency with speed and expertise.', icon: 'ambulance', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80', features: ['24/7 availability', 'Trauma care', 'Rapid response'] },
      { title: 'Specialized Surgeries', description: 'State-of-the-art surgical suites and experienced surgeons performing a wide range of procedures using the latest minimally invasive techniques.', icon: 'stethoscope', image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80', features: ['Minimally invasive', 'Robotic surgery', 'Post-op care'] },
      { title: 'Diagnostic Imaging', description: 'Advanced imaging services including MRI, CT scans, X-ray, and ultrasound with rapid results interpretation by experienced radiologists.', icon: 'scan', image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80', features: ['MRI & CT scans', 'Digital X-ray', 'Ultrasound'] },
    ],
    clinic: [
      { title: 'General Consultation', description: 'Comprehensive primary care services for patients of all ages. Our experienced physicians provide thorough evaluations and personalized treatment plans.', icon: 'stethoscope', image: 'https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=800&q=80', features: ['Health checkups', 'Chronic disease management', 'Preventive care'] },
      { title: 'Vaccinations & Immunizations', description: 'Stay protected with our complete vaccination services for children and adults, including flu shots, travel vaccines, and routine immunizations.', icon: 'syringe', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80', features: ['Childhood vaccines', 'Travel vaccinations', 'Annual flu shots'] },
      { title: 'Health Screenings', description: 'Regular health screenings are vital for early detection. We offer comprehensive health packages tailored to your age, gender, and medical history.', icon: 'clipboard-check', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', features: ['Blood work', 'Cardiac screening', 'Cancer screening'] },
    ],
    'law-firm': [
      { title: 'Corporate Law', description: 'Comprehensive legal services for businesses of all sizes, including entity formation, contracts, mergers, acquisitions, and corporate governance.', icon: 'building', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80', features: ['Business formation', 'Contract review', 'M&A advisory'] },
      { title: 'Family Law', description: 'Compassionate legal representation for family matters including divorce, child custody, adoption, and estate planning with sensitivity and discretion.', icon: 'heart', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80', features: ['Divorce proceedings', 'Child custody', 'Estate planning'] },
      { title: 'Criminal Defense', description: 'Aggressive criminal defense representation protecting your rights and freedom. Our experienced attorneys build strong cases for the best possible outcomes.', icon: 'shield', image: 'https://images.unsplash.com/photo-1447968954315-3f0c44f7313c?w=800&q=80', features: ['DUI defense', 'White-collar crime', 'Appeals'] },
      { title: 'Personal Injury', description: 'Fight for the compensation you deserve after an accident or injury. We handle personal injury claims with dedication and proven results.', icon: 'scale', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80', features: ['Car accidents', 'Medical malpractice', 'Wrongful death'] },
    ],
    construction: [
      { title: 'Residential Construction', description: 'Build your dream home with our expert team. From custom homes to renovations, we deliver quality craftsmanship and exceptional attention to detail.', icon: 'home', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', features: ['Custom home building', 'Home renovations', 'Additions & extensions'] },
      { title: 'Commercial Construction', description: 'Full-service commercial construction for offices, retail spaces, and industrial facilities. We deliver projects on time and within budget.', icon: 'building', image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80', features: ['Office construction', 'Retail fit-outs', 'Industrial builds'] },
      { title: 'Renovation & Remodeling', description: 'Transform your existing space with our comprehensive renovation services. We breathe new life into homes and businesses with quality remodeling.', icon: 'tools', image: 'https://images.unsplash.com/photo-1571632836272-4aa9a5a0e5d3?w=800&q=80', features: ['Kitchen remodeling', 'Bathroom renovation', 'Basement finishing'] },
    ],
    hotel: [
      { title: 'Luxury Accommodations', description: 'Experience unparalleled comfort in our elegantly appointed rooms and suites, featuring premium amenities, stunning views, and thoughtful touches.', icon: 'bed', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', price: 'From $199/night', features: ['Premium bedding', 'Room service', 'City views'] },
      { title: 'Fine Dining', description: 'Savor exceptional cuisine at our onsite restaurants, featuring world-class chefs, seasonal menus, and an extensive wine selection.', icon: 'utensils', image: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=800&q=80', price: '$$$', features: ['Breakfast buffet', 'Fine dining dinner', 'Bar & lounge'] },
      { title: 'Spa & Wellness', description: 'Rejuvenate body and mind at our full-service spa, offering massages, facials, body treatments, and a state-of-the-art fitness center.', icon: 'spa', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80', price: 'From $89', features: ['Massage therapy', 'Facial treatments', 'Steam & sauna'] },
      { title: 'Events & Conferences', description: 'Host memorable events in our versatile event spaces, from intimate gatherings to grand celebrations and business conferences.', icon: 'calendar-check', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', features: ['Ballroom & meeting rooms', 'AV equipment', 'Catering services'] },
    ],
    'travel-agency': [
      { title: 'Custom Vacation Packages', description: 'Let us design your perfect getaway. We create personalized travel itineraries that match your interests, budget, and travel style.', icon: 'globe', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80', features: ['Custom itineraries', 'Best price guarantee', '24/7 support'] },
      { title: 'Group Travel & Tours', description: 'Experience the world together with our expertly guided group tours. Perfect for families, friends, and organizations seeking unforgettable adventures.', icon: 'users', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', features: ['Expert guides', 'All-inclusive options', 'Small groups'] },
      { title: 'Corporate Travel Management', description: 'Streamline your business travel with our corporate travel solutions, offering preferred rates, efficient booking, and dedicated support.', icon: 'briefcase', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80', features: ['Corporate rates', 'Travel policy management', 'Expense reporting'] },
      { title: 'Adventure Travel', description: 'Feed your wanderlust with thrilling adventure travel packages. From trekking to diving, we arrange unforgettable experiences worldwide.', icon: 'mountain', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', features: ['Guided adventures', 'Equipment included', 'Safety certified'] },
    ],
    school: [
      { title: 'Early Childhood Education', description: 'Nurturing foundation for young learners aged 3-5, focusing on social, emotional, and cognitive development through play-based learning.', icon: 'baby', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80', features: ['Montessori approach', 'Low student-teacher ratio', 'Safe environment'] },
      { title: 'Primary & Secondary Education', description: 'Comprehensive academic programs from grade 1 through 12, following a rigorous curriculum that prepares students for higher education and beyond.', icon: 'book', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80', features: ['STEM focus', 'Liberal arts', 'College counseling'] },
      { title: 'Extracurricular Programs', description: 'Enrich your child\'s education with our diverse extracurricular activities including sports, arts, music, debate, and technology clubs.', icon: 'music', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80', features: ['Sports teams', 'Music & arts', 'Robotics club'] },
    ],
    'coaching-institute': [
      { title: 'Exam Preparation', description: 'Expert coaching for competitive exams including JEE, NEET, GATE, and more. Our proven methodology and comprehensive study materials ensure top results.', icon: 'graduation-cap', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80', features: ['Mock tests', 'Study materials', 'Doubt sessions'] },
      { title: 'Academic Tutoring', description: 'Personalized tutoring for school and college students across all subjects. Our experienced teachers help students build strong fundamentals and excel academically.', icon: 'book-open', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80', features: ['One-on-one sessions', 'Homework help', 'Concept clarity'] },
      { title: 'Career Counseling', description: 'Guidance and mentorship to help students make informed career decisions. We provide aptitude assessments, career mapping, and college admission support.', icon: 'compass', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80', features: ['Aptitude tests', 'Career mapping', 'Admission guidance'] },
      { title: 'Skill Development', description: 'Enhance your professional skills with our workshops in communication, leadership, coding, public speaking, and personality development.', icon: 'zap', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', features: ['Communication skills', 'Coding bootcamps', 'Leadership training'] },
    ],
    cafe: [
      { title: 'Artisanal Coffee', description: 'Experience the perfect cup, crafted from single-origin beans roasted to perfection. Our baristas are passionate about bringing you the best coffee experience in town.', icon: 'coffee', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', price: 'From $3.50', features: ['Single-origin beans', 'Pour-over & espresso', 'Plant-based options'] },
      { title: 'Fresh Bakery', description: 'Indulge in our daily selection of freshly baked pastries, breads, and desserts made with love using traditional recipes and premium ingredients.', icon: 'bread', image: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&q=80', price: 'From $2.50', features: ['Artisan bread', 'Croissants & pastries', 'Gluten-free options'] },
      { title: 'Brunch & Light Bites', description: 'Enjoy a delightful selection of brunch favorites, sandwiches, salads, and comfort food made from fresh, locally sourced ingredients.', icon: 'utensils', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', price: 'From $8', features: ['All-day brunch', 'Healthy options', 'Seasonal specials'] },
    ],
    'interior-designer': [
      { title: 'Residential Interior Design', description: 'Transform your home into a personalized sanctuary. We create beautiful, functional living spaces that reflect your unique style and enhance your everyday life.', icon: 'home', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80', features: ['Full home design', 'Room makeovers', 'Space planning'] },
      { title: 'Commercial Interior Design', description: 'Create inspiring workspaces that boost productivity and leave a lasting impression. We design offices, retail spaces, and hospitality venues.', icon: 'building', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', features: ['Office design', 'Retail spaces', 'Restaurant design'] },
      { title: 'Furniture & Decor Curation', description: 'Complete your space with carefully selected furniture, lighting, and decor pieces. We source unique items that complement your design perfectly.', icon: 'armchair', image: 'https://images.unsplash.com/photo-1615876234886-f78d2f60963a?w=800&q=80', features: ['Custom furniture', 'Accessory styling', 'Art curation'] },
    ],
  };

  const services = industryServices[category] || [
    { title: 'Professional Consultation', description: `Expert consultation services tailored to your needs. Our team at ${businessName} provides personalized guidance and solutions.`, icon: 'users', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', features: ['Expert assessment', 'Customized plan', 'Follow-up support'] },
    { title: 'Premium Service', description: `Comprehensive ${category.replace(/-/g, ' ')} solutions delivered with professionalism, attention to detail, and a commitment to excellence.`, icon: 'star', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80', features: ['Quality guaranteed', 'Timely delivery', 'Ongoing support'] },
  ];

  return services.map(s => ({
    ...s,
    image: pick(INDUSTRY_IMAGE_MAP[category]?.services || ['https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80']),
  }));
}

function generateTestimonials(businessName: string, category: string): TestimonialItem[] {
  const industryTestimonials: Record<string, TestimonialItem[]> = {
    restaurant: [
      { name: 'Priya Sharma', role: 'Regular Guest', content: `Absolutely incredible dining experience at ${businessName}! The tasting menu was a masterpiece, and the service was impeccable. Every dish told a story.`, rating: 5, avatar: 'https://i.pravatar.cc/150?img=1' },
      { name: 'Rahul Mehta', role: 'Food Blogger', content: `${businessName} has raised the bar for fine dining in Pune. The ambiance, the presentation, and most importantly the flavors — everything was world-class. A must-visit!`, rating: 5, avatar: 'https://i.pravatar.cc/150?img=3' },
      { name: 'Ananya Patel', role: 'Event Host', content: 'We hosted our anniversary dinner here and it was perfect. The private dining room was elegant, the chef customized the menu, and the staff went above and beyond.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=5' },
    ],
    gym: [
      { name: 'Arjun Kapoor', role: 'Member for 2 years', content: `${businessName} completely transformed my approach to fitness. The trainers are knowledgeable, the equipment is top-notch, and the community keeps me motivated.`, rating: 5, avatar: 'https://i.pravatar.cc/150?img=8' },
      { name: 'Neha Singh', role: 'Yoga Class Member', content: 'I love the variety of classes at this gym. The yoga sessions with Priya are incredible — I\'ve never felt more flexible and strong. Highly recommend!', rating: 5, avatar: 'https://i.pravatar.cc/150?img=9' },
      { name: 'Vikram Joshi', role: 'Personal Training Client', content: 'The personal training program helped me lose 15 kg in 4 months. My trainer designed a perfect plan for my goals and kept me accountable throughout.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=11' },
    ],
    salon: [
      { name: 'Maya Patel', role: 'Regular Client', content: `${businessName} is my go-to salon in Mumbai. The stylists really listen to what you want and deliver amazing results. My balayage turned out absolutely stunning!`, rating: 5, avatar: 'https://i.pravatar.cc/150?img=12' },
      { name: 'Sneha Reddy', role: 'Beauty Enthusiast', content: 'The facial treatment I received was incredibly relaxing and my skin has never looked better. The ambiance is luxurious and the staff is so professional.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=13' },
    ],
    'real-estate': [
      { name: 'Amit Khanna', role: 'Home Buyer', content: `${businessName} made finding our dream home effortless. Their team understood exactly what we were looking for and negotiated an excellent deal on our behalf.`, rating: 5, avatar: 'https://i.pravatar.cc/150?img=16' },
      { name: 'Deepa Iyer', role: 'Property Investor', content: 'Professional, knowledgeable, and incredibly helpful. They helped me build a diverse property portfolio with excellent ROI. Highly recommend their investment services.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=17' },
    ],
    hospital: [
      { name: 'Dr. Suresh Kumar', role: 'Patient Family Member', content: `The care my father received at ${businessName} was exceptional. The doctors were attentive, the nurses compassionate, and the facilities world-class.`, rating: 5, avatar: 'https://i.pravatar.cc/150?img=20' },
      { name: 'Lakshmi Narayan', role: 'Patient', content: 'I underwent surgery here and the entire experience, from admission to discharge, was smooth and reassuring. The medical team was outstanding.', rating: 5, avatar: 'https://i.pravatar.cc/150?img=21' },
    ],
  };

  const defaults: TestimonialItem[] = [
    { name: 'Rajesh Kumar', role: 'Happy Client', content: `${businessName} provided exceptional service. Their team was professional, responsive, and delivered beyond our expectations. Highly recommended!`, rating: 5, avatar: 'https://i.pravatar.cc/150?img=25' },
    { name: 'Priya Nair', role: 'Regular Customer', content: `I\'ve been a loyal customer of ${businessName} for years. Their commitment to quality and customer satisfaction is unmatched. Truly the best in the business.`, rating: 5, avatar: 'https://i.pravatar.cc/150?img=26' },
    { name: 'Vivek Sharma', role: 'Business Partner', content: `Working with ${businessName} has been a pleasure. Their professionalism, expertise, and dedication make them stand out. I wouldn\'t hesitate to recommend them.`, rating: 5, avatar: 'https://i.pravatar.cc/150?img=27' },
  ];

  return industryTestimonials[category] || defaults;
}

function generateFaq(businessName: string, category: string): FaqItem[] {
  const industryFaq: Record<string, FaqItem[]> = {
    restaurant: [
      { question: 'What type of cuisine do you serve?', answer: `${businessName} specializes in contemporary international cuisine with a focus on seasonal, locally-sourced ingredients. Our menu changes regularly to showcase the freshest produce and innovative culinary techniques.` },
      { question: 'Do you accommodate dietary restrictions?', answer: 'Absolutely! We offer vegetarian, vegan, gluten-free, and Jain options. Please inform us of any dietary requirements when making your reservation, and our chef will be happy to customize dishes for you.' },
      { question: 'How do I make a reservation?', answer: 'You can book a table through our website\'s reservation system, call us directly, or use our mobile app. We recommend booking at least 2-3 days in advance for weekend dining.' },
      { question: 'Do you offer catering services?', answer: 'Yes, we provide full-service catering for events of all sizes, from intimate gatherings to large corporate functions. Our events team will work with you to create a customized menu.' },
      { question: 'What is your dress code?', answer: 'We maintain a smart casual dress code. While we want our guests to feel comfortable, we kindly request no beachwear or sportswear in the dining area.' },
    ],
    gym: [
      { question: 'What membership options do you offer?', answer: `${businessName} offers flexible membership plans including monthly, quarterly, and annual options. We also have student discounts, corporate memberships, and family packages. All memberships include full access to equipment and group classes.` },
      { question: 'Do you offer trial memberships?', answer: 'Yes! We offer a free 7-day trial pass that gives you full access to our facilities and group classes. It\'s the perfect way to experience our gym before committing to a membership.' },
      { question: 'What are your operating hours?', answer: 'We\'re open Monday to Friday from 5:00 AM to 11:00 PM, Saturday from 6:00 AM to 9:00 PM, and Sunday from 7:00 AM to 8:00 PM. Our staff is available during all operating hours.' },
      { question: 'Do you have personal trainers?', answer: 'Absolutely! Our certified personal trainers are available for one-on-one sessions. We\'ll assess your fitness level, discuss your goals, and create a customized training program just for you.' },
    ],
    salon: [
      { question: 'How do I book an appointment?', answer: `You can book an appointment at ${businessName} through our website, by phone, or by visiting us in person. We recommend booking at least a week in advance for weekend appointments.` },
      { question: 'What products do you use?', answer: 'We use premium professional products from leading brands including L\'Oréal Professionnel, Wella, Moroccanoil, and Kérastase. Our team can recommend the best products for your hair and skin type.' },
      { question: 'Do you offer bridal packages?', answer: 'Yes, we offer comprehensive bridal packages including trial sessions, bridal makeup, hairstyling, and packages for the bridal party. Contact us for a personalized consultation.' },
    ],
    hospital: [
      { question: 'What insurance plans do you accept?', answer: `${businessName} accepts all major insurance plans including cashless treatment options. Please contact our insurance desk to verify your coverage and understand the claim process.` },
      { question: 'Do you offer emergency services?', answer: 'Yes, our emergency department is open 24/7 with board-certified emergency physicians, trauma surgeons, and support staff ready to handle any medical emergency.' },
      { question: 'How do I book an appointment?', answer: 'Appointments can be booked through our website, mobile app, or by calling our helpline. We also offer online consultations with select specialists for your convenience.' },
    ],
    'law-firm': [
      { question: 'How much do your services cost?', answer: `At ${businessName}, we offer transparent pricing. Our fee structure varies based on the type of case and complexity. We provide a free initial consultation to discuss your case and provide a detailed fee estimate.` },
      { question: 'What should I bring to my first consultation?', answer: 'Please bring any relevant documents, contracts, correspondence, and identification. The more information you provide, the better we can assess your case and provide accurate advice.' },
      { question: 'How long will my case take?', answer: 'The duration varies significantly depending on the type of case, its complexity, and court schedules. We\'ll provide a realistic timeline during your initial consultation based on our experience with similar cases.' },
    ],
    school: [
      { question: 'What is the admission process?', answer: `The admission process at ${businessName} includes submitting an application, entrance assessment, and an interaction with our faculty. We welcome applications throughout the year subject to seat availability.` },
      { question: 'What curriculum do you follow?', answer: 'We follow the CBSE curriculum with an integrated approach that emphasizes conceptual understanding, critical thinking, and practical application. Our curriculum is enhanced with modern teaching methodologies.' },
      { question: 'What extracurricular activities are offered?', answer: 'We offer a wide range of extracurricular activities including sports, music, dance, drama, art, debate, robotics, and community service. Participation in at least one extracurricular is encouraged for all students.' },
    ],
    'coaching-institute': [
      { question: 'Which exams do you prepare students for?', answer: `${businessName} offers comprehensive coaching for JEE Main & Advanced, NEET UG, GATE, CAT, CLAT, and various other competitive exams. We also provide foundation courses for grades 8-10.` },
      { question: 'How are your faculty members?', answer: 'Our faculty comprises highly qualified and experienced educators, many of whom are IIT/NIT alumni with years of teaching experience. They are dedicated to providing personalized attention to every student.' },
      { question: 'Do you offer online classes?', answer: 'Yes, we offer both online and offline classes. Our online platform provides live interactive sessions, recorded lectures, digital study materials, and regular assessments.' },
      { question: 'What is your fee structure?', answer: 'Our fee structure is competitive and designed to provide value for money. We offer flexible payment options and scholarships for meritorious students. Please contact us for detailed fee information.' },
    ],
    'travel-agency': [
      { question: 'How do I customize a travel package?', answer: `Simply contact our travel consultants with your preferences, budget, and travel dates. We'll create a personalized itinerary that matches your interests, whether you're looking for adventure, relaxation, or cultural experiences.` },
      { question: 'Do you offer travel insurance?', answer: 'Yes, we strongly recommend travel insurance for all bookings. We offer comprehensive travel insurance plans that cover trip cancellations, medical emergencies, lost baggage, and more.' },
      { question: 'What payment options are available?', answer: 'We accept all major credit cards, debit cards, net banking, UPI, and EMI options. You can also pay in installments for select packages through our easy payment plans.' },
    ],
    hotel: [
      { question: 'What are your check-in and check-out times?', answer: `Check-in at ${businessName} is from 2:00 PM and check-out is until 11:00 AM. Early check-in and late check-out are available subject to availability, and may incur additional charges.` },
      { question: 'Do you offer airport transfers?', answer: 'Yes, we provide airport pickup and drop-off services at an additional cost. Please inform us of your flight details at least 24 hours in advance to arrange transportation.' },
      { question: 'Is breakfast included?', answer: 'Breakfast is included with all room bookings. We serve a complimentary buffet breakfast from 7:00 AM to 10:30 AM featuring a selection of international and local dishes.' },
    ],
    photographer: [
      { question: 'How far in advance should I book?', answer: `For wedding photography, we recommend booking ${businessName} at least 4-6 months in advance, especially during peak wedding season. Portrait sessions can usually be booked 2-4 weeks ahead.` },
      { question: 'Do you travel for shoots?', answer: 'Yes, we love traveling for shoots! Travel expenses may apply depending on the location. We\'ve shot at destinations across India including Goa, Udaipur, Kerala, and the Himalayas.' },
      { question: 'What is your editing turnaround time?', answer: 'Portrait galleries are typically delivered within 1-2 weeks. Wedding albums may take 4-6 weeks for complete delivery as we carefully edit and retouch each image to perfection.' },
    ],
    construction: [
      { question: 'How do I get a quote for my project?', answer: `Contact ${businessName} for a free consultation. Our team will visit your site, discuss your requirements, and provide a detailed quotation within 3-5 business days.` },
      { question: 'Are you licensed and insured?', answer: 'Yes, we are fully licensed, bonded, and insured. We maintain comprehensive liability insurance and workers\' compensation coverage for all our projects.' },
      { question: 'What is the typical timeline for a home renovation?', answer: 'Timelines vary based on the scope of work. A kitchen renovation typically takes 4-6 weeks, while a full home renovation may take 3-6 months. We provide detailed timelines during the planning phase.' },
    ],
    'interior-designer': [
      { question: 'What is your design process?', answer: `Our process at ${businessName} begins with a consultation to understand your vision, followed by concept development, design presentation, material selection, and finally implementation. We keep you involved at every step.` },
      { question: 'How much does interior design cost?', answer: 'Our fees vary based on the project scope and size. We offer both hourly consultations and fixed-price packages. The initial consultation is complimentary, during which we\'ll provide a detailed proposal.' },
      { question: 'Do you work with my budget?', answer: 'Absolutely! We believe great design is achievable at any budget. We\'ll work within your financial parameters to create a space that exceeds your expectations without compromising on quality.' },
    ],
    clinic: [
      { question: 'Do I need an appointment?', answer: `While walk-ins are welcome at ${businessName}, we recommend booking an appointment to minimize wait times. Same-day appointments are often available for urgent concerns.` },
      { question: 'What should I bring to my first visit?', answer: 'Please bring a valid ID, your insurance card, any previous medical records, and a list of current medications. This helps us provide the most comprehensive care possible.' },
      { question: 'Do you offer telemedicine consultations?', answer: 'Yes, we offer virtual consultations for select services. Telemedicine appointments are convenient for follow-ups, prescription refills, and minor health concerns.' },
    ],
  };

  const defaults: FaqItem[] = [
    { question: 'What services do you offer?', answer: `${businessName} offers a comprehensive range of ${category.replace(/-/g, ' ')} services tailored to meet your specific needs. Contact us for a detailed discussion about how we can help you.` },
    { question: 'How can I contact you?', answer: 'You can reach us by phone, email, or through our website\'s contact form. Our team typically responds within 24 hours during business days.' },
    { question: 'What areas do you serve?', answer: `We primarily serve clients in ${businessName}'s local area and surrounding regions. Contact us to confirm availability for your location.` },
    { question: 'Do you offer free consultations?', answer: 'Yes, we offer a free initial consultation to understand your requirements and discuss how we can assist you. There is no obligation, and you\'ll receive professional advice tailored to your situation.' },
  ];

  return industryFaq[category] || defaults;
}

function generateGalleryContent(category: string): GalleryItem[] {
  const images = INDUSTRY_IMAGE_MAP[category]?.gallery || [];
  return images.map((src, i) => ({
    src,
    alt: `${category.replace(/-/g, ' ')} gallery image ${i + 1}`,
    caption: undefined,
  }));
}

function generateFallbackContent(
  businessName: string,
  category: string,
  location: string,
  phone: string,
  email: string,
  themeName?: string
): GeneratedContent {
  const industryKey = Object.keys(INDUSTRY_CONFIGS).includes(category) ? category : 'restaurant';
  const config = INDUSTRY_CONFIGS[industryKey] as IndustryConfig;
  const theme = themeName && THEMES[themeName] ? THEMES[themeName] : getTheme(config.suggestedTheme);

  const hero = generateHeroContent(businessName, industryKey, location, config);
  const navbar = generateNavbarContent(industryKey, config);
  const about = generateAboutContent(businessName, industryKey, location, config);
  const services = generateServices(businessName, industryKey, config);
  const testimonials = generateTestimonials(businessName, industryKey);
  const faq = generateFaq(businessName, industryKey);
  const gallery = generateGalleryContent(industryKey);
  const hours = generateHours(industryKey);
  const contact = generateContactContent(businessName, location, phone, email, industryKey);
  const footer = generateFooterContent(businessName, location, industryKey);
  const seo = generateSeoContent(businessName, category, location, config);

  const taglineMap: Record<string, string> = {
    restaurant: `Experience the Finest Dining in ${location}`,
    cafe: `Your Perfect Cup Awaits in ${location}`,
    gym: `Transform Your Body, Transform Your Life in ${location}`,
    salon: `Unleash Your Beauty in ${location}`,
    hospital: `Your Health, Our Priority in ${location}`,
    clinic: `Caring for ${location}, One Patient at a Time`,
    'law-firm': `Justice Delivered with Excellence in ${location}`,
    construction: `Building Dreams in ${location}`,
    'interior-designer': `Designing Beautiful Spaces in ${location}`,
    photographer: `Capturing ${location}'s Most Precious Moments`,
    hotel: `Luxury Redefined in the Heart of ${location}`,
    'travel-agency': `Your Journey Begins in ${location}`,
    'real-estate': `Find Your Perfect Place in ${location}`,
    school: `Shaping Tomorrow's Leaders in ${location}`,
    'coaching-institute': `Empowering Academic Excellence in ${location}`,
  };

  const missionMap: Record<string, string> = {
    restaurant: `To create extraordinary culinary experiences that bring people together through the art of fine food and impeccable service.`,
    gym: `To empower individuals to achieve their peak physical potential through expert guidance, premium facilities, and a supportive community.`,
    salon: `To enhance natural beauty and boost confidence through expert styling, premium products, and exceptional care in a luxurious setting.`,
    hospital: `To provide compassionate, world-class healthcare that improves lives and strengthens the communities we serve.`,
    school: `To nurture curious minds, foster creativity, and develop well-rounded individuals prepared to excel in an ever-changing world.`,
  };

  return {
    businessName,
    tagline: taglineMap[industryKey] || `Premier ${category.replace(/-/g, ' ')} Services in ${location}`,
    mission: missionMap[industryKey] || `To deliver exceptional ${category.replace(/-/g, ' ')} services that exceed expectations and create lasting value for our clients and community.`,
    description: `${businessName} is a leading ${category.replace(/-/g, ' ')} service provider based in ${location}, dedicated to delivering outstanding quality, personalized service, and exceptional results.`,
    hero,
    navbar,
    about,
    services,
    testimonials,
    faq,
    gallery,
    contact,
    footer,
    hours,
    seo,
  };
}

const AI_SYSTEM_PROMPT = `You are an expert website content strategist and copywriter. Generate complete, production-ready website content for a local business.

INSTRUCTIONS:
1. Generate realistic, specific content - NEVER use "Lorem Ipsum" or placeholder text
2. Use actual business details, real-sounding service names, and authentic testimonials
3. Adapt all content to the specific industry and location provided
4. Return ONLY valid JSON - no markdown, no code fences, no explanation

REQUIRED JSON STRUCTURE:
{
  "businessName": "string",
  "tagline": "string (short, impactful, mentions location)",
  "mission": "string (one sentence mission statement)",
  "description": "string (one paragraph business description)",
  "hero": {
    "headline": "string (powerful, benefit-driven)",
    "subheadline": "string (supporting value proposition)",
    "ctaText": "string (action-oriented)"
  },
  "navbar": {
    "links": [{ "label": "string", "href": "string" }],
    "cta": { "text": "string", "href": "#contact" }
  },
  "about": {
    "title": "string",
    "content": "string (2-3 paragraphs about history, values, team)",
    "stats": [{ "value": "string", "label": "string" }]
  },
  "services": [
    {
      "title": "string",
      "description": "string (2-3 sentences)",
      "features": ["string"]
    }
  ],
  "testimonials": [
    {
      "name": "string (Indian name)",
      "role": "string",
      "content": "string (specific, detailed review)",
      "rating": 5
    }
  ],
  "faq": [
    { "question": "string", "answer": "string (detailed)" }
  ],
  "hours": {
    "monday": { "open": "09:00", "close": "18:00" },
    "tuesday": { "open": "09:00", "close": "18:00" },
    "wednesday": { "open": "09:00", "close": "18:00" },
    "thursday": { "open": "09:00", "close": "18:00" },
    "friday": { "open": "09:00", "close": "18:00" },
    "saturday": { "open": "10:00", "close": "16:00" },
    "sunday": null
  },
  "seo": {
    "metaTitle": "string (max 60 chars, include business name and location)",
    "metaDescription": "string (max 160 chars)",
    "keywords": ["string"]
  }
}`;

export class WebsiteContentService {
  private aiEngine: AIEngineService;

  constructor() {
    this.aiEngine = new AIEngineService();
  }

  async generate(input: {
    businessName: string;
    category: string;
    location: string;
    phone: string;
    email: string;
    theme?: string;
    userId: string;
    websiteId?: string;
  }): Promise<GeneratedContent> {
    const { businessName, category, location, phone, email, theme, userId, websiteId } = input;

    const industryKey = Object.keys(INDUSTRY_CONFIGS).includes(category) ? category : 'restaurant';

    try {
      if (config.nvidia.enabled) {
        const userPrompt = `Generate complete website content for ${businessName}, a ${category.replace(/-/g, ' ')} business located in ${location}.
        Phone: ${phone}, Email: ${email}.
        Generate realistic, specific content with real service names, detailed FAQs, and authentic testimonials from Indian names.
        Create 4-6 services, 4-6 FAQs, 3 testimonials. Make all content specific to ${category}.`;

        const request: AICompletionRequest = {
          taskType: AITaskType.WEBSITE_GENERATION,
          userId,
          websiteId,
          systemPrompt: AI_SYSTEM_PROMPT,
          userPrompt,
          responseFormat: 'json_object',
          temperature: 0.7,
          maxTokens: 4096,
        };

        const response = await this.aiEngine.generate(request);
        const aiContent = JSON.parse(response.content);

        const industryLabel = category.replace(/-/g, ' ');
        const images = INDUSTRY_IMAGE_MAP[industryKey];

        const generatedContent: GeneratedContent = {
          businessName,
          tagline: aiContent.tagline || `Premier ${industryLabel} in ${location}`,
          mission: aiContent.mission || `Delivering exceptional ${industryLabel} services in ${location}.`,
          description: aiContent.description || `${businessName} is a trusted ${industryLabel} provider in ${location}.`,
          hero: {
            headline: aiContent.hero?.headline || `Welcome to ${businessName}`,
            subheadline: aiContent.hero?.subheadline || `Your trusted ${industryLabel} partner in ${location}`,
            ctaText: aiContent.hero?.ctaText || 'Get Started',
            backgroundImage: (images?.hero || [])[0] || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
          },
          navbar: {
            links: (aiContent.navbar?.links || []).length > 0 ? aiContent.navbar.links : [],
            cta: aiContent.navbar?.cta || null,
          },
          about: {
            title: aiContent.about?.title || `About ${businessName}`,
            content: aiContent.about?.content || '',
            image: (images?.about || [])[0] || '',
            stats: aiContent.about?.stats || [{ value: '10+', label: 'Years Experience' }, { value: '500+', label: 'Happy Clients' }, { value: '98%', label: 'Satisfaction' }],
          },
          services: (aiContent.services || []).map((s: any, i: number) => ({
            title: s.title,
            description: s.description,
            icon: s.icon || 'star',
            image: (images?.services || [])[i % (images?.services?.length || 1)] || '',
            price: s.price,
            features: s.features || [],
          })),
          gallery: (images?.gallery || []).map((src, i) => ({
            src,
            alt: `${industryLabel} image ${i + 1}`,
          })),
          testimonials: (aiContent.testimonials || []).map((t: any) => ({
            name: t.name || 'Client',
            role: t.role || '',
            content: t.content || '',
            rating: t.rating || 5,
            avatar: t.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          })),
          faq: aiContent.faq || [],
          contact: {
            phone,
            email,
            address: `${businessName}, ${location}`,
            mapUrl: `https://www.google.com/maps?q=${encodeURIComponent(businessName + ' ' + location)}`,
            socialLinks: [
              { platform: 'Facebook', url: 'https://facebook.com/', icon: 'facebook' },
              { platform: 'Instagram', url: 'https://instagram.com/', icon: 'instagram' },
            ],
          },
          footer: {
            description: `${businessName} is dedicated to providing exceptional ${industryLabel} services in ${location}.`,
            copyright: `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
            links: [
              { label: 'Home', href: '#home' },
              { label: 'About', href: '#about' },
              { label: 'Services', href: '#services' },
              { label: 'Contact', href: '#contact' },
            ],
          },
          hours: aiContent.hours || generateHours(industryKey),
          seo: {
            metaTitle: aiContent.seo?.metaTitle || `${businessName} | Best ${industryLabel} in ${location}`,
            metaDescription: aiContent.seo?.metaDescription || `${businessName} offers professional ${industryLabel} services in ${location}. Contact us today.`,
            keywords: aiContent.seo?.keywords || [businessName, industryLabel, location],
          },
        };

        return generatedContent;
      }
    } catch (error) {
      Logger.warn('AI generation failed, using fallback content', { error: (error as Error).message, businessName });
    }

    return generateFallbackContent(businessName, category, location, phone, email, theme);
  }

  generateStructuredData(content: GeneratedContent, category: string): Record<string, any> {
    const industryKey = Object.keys(INDUSTRY_CONFIGS).includes(category) ? category : 'restaurant';
    const config = INDUSTRY_CONFIGS[industryKey] as IndustryConfig;
    return generateStructuredData(content, industryKey, config);
  }

  getIndustryConfig(category: string): typeof INDUSTRY_CONFIGS[string] | undefined {
    return INDUSTRY_CONFIGS[category];
  }

  getTheme(themeName?: string): ThemeConfig {
    return getTheme(themeName);
  }
}
