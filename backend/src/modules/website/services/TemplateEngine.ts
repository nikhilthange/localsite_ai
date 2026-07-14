import { Logger } from '../../../core/logging/Logger';
import { AIClient } from '../../ai/services/AIClient';
import { TokenUsageService } from '../../ai/services/TokenUsageService';
import { AICreditService } from '../../ai/services/AICreditService';
import { AITaskType, AICompletionRequest, AICompletionResponse, TASK_DEFAULT_MAX_TOKENS, AIModel } from '../../ai/types';
import type { AiGeneratedWebsite } from '../../../types/website';
import { ImageService } from './ImageService';
import { emitToUser } from '../../../core/socket/SocketSetup';

const SYSTEM_PROMPT = `You are a premium website designer. Generate a complete business website as JSON. Return ONLY valid JSON. Never use markdown or fences.`;

const USER_PROMPT_TEMPLATE = `Business: {{businessName}} | {{category}} | {{location}}
Description: {{description}}
Style: {{style}} | Tone: {{tone}}
Primary Color: {{primaryColor}} | Secondary Color: {{secondaryColor}}
Target Audience: {{audience}}

Generate ALL sections below as top-level JSON keys. Every word must be 100% specific to this business. Never generic.

{
  "branding": {
    "businessName": "{{businessName}}",
    "tagline": "8-12 word tagline mentioning location",
    "description": "15-25 word description of what the business does",
    "logoPrompt": "detailed prompt for AI logo generation describing style, colors, industry symbols, mood",
    "primaryColor": "{{primaryColor}}",
    "secondaryColor": "{{secondaryColor}}",
    "fontHeading": "premium Google Font name for headings",
    "fontBody": "premium Google Font name for body text"
  },
  "navigation": [
    { "label": "Home", "href": "#home" },
    { "label": "About", "href": "#about" },
    { "label": "Services", "href": "#services" },
    { "label": "Testimonials", "href": "#testimonials" },
    { "label": "Contact", "href": "#contact" }
  ],
  "hero": {
    "title": "powerful headline including {{businessName}}",
    "subtitle": "compelling value proposition 12-18 words",
    "ctaText": "action-oriented primary button",
    "ctaLink": "#contact",
    "badge": "trust signal like Trusted Since 2010",
    "backgroundType": "image",
    "layout": "centered"
  },
  "about": {
    "title": "About {{businessName}}",
    "content": "two paragraphs separated by \\n covering founding story and values",
    "mission": "one sentence mission statement",
    "vision": "one sentence vision statement"
  },
  "services": [
    {
      "title": "service name",
      "description": "2-3 compelling sentences unique to this business",
      "icon": "icon-name",
      "features": ["specific feature 1", "specific feature 2", "specific feature 3", "specific feature 4"],
      "price": "price string or empty",
      "period": "period string or empty",
      "cta": "Learn More"
    }
  ],
  "features": [
    { "title": "feature name", "description": "one sentence benefit", "icon": "icon-name" }
  ],
  "benefits": [
    { "title": "benefit name", "description": "one sentence why this matters to customers" }
  ],
  "stats": [
    { "value": "500+", "label": "label", "icon": "icon-name" }
  ],
  "pricing": [
    {
      "title": "plan name",
      "price": "$XX",
      "period": "/month",
      "description": "one sentence",
      "features": ["feature 1", "feature 2", "feature 3", "feature 4"],
      "cta": "Choose Plan",
      "featured": false
    }
  ],
  "testimonials": [
    {
      "name": "realistic full name",
      "role": "customer role",
      "company": "business name or empty",
      "content": "specific detailed review mentioning measurable results or experience",
      "rating": 5,
      "avatar": ""
    }
  ],
  "faq": [
    { "question": "common customer question", "answer": "detailed helpful answer 2-3 sentences" }
  ],
  "team": [
    { "name": "full name", "role": "job title", "bio": "1-2 sentence bio", "avatar": "" }
  ],
  "gallery": [
    { "src": "", "alt": "description", "caption": "optional caption" }
  ],
  "process": [
    { "title": "step name", "description": "one sentence", "icon": "icon-name" }
  ],
  "cta": {
    "title": "action-oriented headline",
    "subtitle": "compelling reason to act",
    "buttonText": "Contact Us Today",
    "buttonLink": "#contact",
    "backgroundType": "gradient"
  },
  "contact": {
    "phone": "business phone or empty",
    "email": "business email or empty",
    "address": "full address or empty",
    "socialLinks": [{ "platform": "Facebook", "url": "https://facebook.com/" }],
    "formFields": [
      { "label": "Name", "type": "text", "placeholder": "Your Name", "required": true },
      { "label": "Email", "type": "email", "placeholder": "your@email.com", "required": true },
      { "label": "Message", "type": "textarea", "placeholder": "Your Message", "required": true }
    ]
  },
  "footer": {
    "description": "compelling brand summary 15-20 words",
    "copyright": "© 2024 {{businessName}}. All rights reserved.",
    "columns": [{ "title": "Quick Links", "links": [{ "label": "Home", "href": "#home" }] }],
    "socialLinks": [{ "platform": "Facebook", "url": "https://facebook.com/" }],
    "showNewsletter": false
  },
  "announcement": { "text": "promotional banner text or empty", "enabled": false },
  "newsletter": { "title": "Stay Updated", "description": "Subscribe for updates", "placeholder": "Enter your email", "buttonText": "Subscribe", "enabled": false },
  "map": { "address": "business address", "lat": 0, "lng": 0, "zoom": 15 },
  "seo": {
    "metaTitle": "under 60 chars including {{businessName}} and location",
    "metaDescription": "under 155 chars compelling description",
    "keywords": ["keyword1", "keyword2"],
    "slug": "url-friendly-business-name",
    "ogTitle": "same as metaTitle",
    "ogDescription": "same as metaDescription",
    "canonicalUrl": "",
    "structuredData": {}
  }
}

CRITICAL RULES:
1. Every piece of text must be specific to {{businessName}}. Never use generic descriptions.
2. Generate 4 services, 4 features, 3 benefits, 3 stats, 3 pricing plans, 3 testimonials, 5 FAQs, 2 team members, 4 gallery items, 3 process steps.
3. Testimonials must sound authentic with specific measurable results.
4. Design feels premium with consistent colors and professional typography.
5. Return ONLY the JSON object. No other text.`;

const FALLBACK_COLORS: Record<string, any> = {
  cafe: { primary: '#6F4E37', secondary: '#F5E6D3', accent: '#D97706', background: '#FDF8F3', surface: '#FFFFFF', text: '#1A1410' },
  restaurant: { primary: '#C0854A', secondary: '#8B6F47', accent: '#E8C88A', background: '#FDF8F3', surface: '#FFFFFF', text: '#2D2418' },
  hotel: { primary: '#B8860B', secondary: '#8B4513', accent: '#D4AF37', background: '#FAF8F5', surface: '#FFFFFF', text: '#1A1410' },
  gym: { primary: '#E8485B', secondary: '#F5A623', accent: '#00C9A7', background: '#0F0F13', surface: '#1A1A20', text: '#F5F5F0' },
  salon: { primary: '#D4708B', secondary: '#B38CD9', accent: '#F0C4C0', background: '#FFF8FA', surface: '#FFFFFF', text: '#3D2C35' },
  hospital: { primary: '#3B82F6', secondary: '#06B6D4', accent: '#10B981', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A' },
  clinic: { primary: '#5B8DEF', secondary: '#82B3D9', accent: '#F0B4A0', background: '#F7FAFD', surface: '#FFFFFF', text: '#1A2744' },
  'law-firm': { primary: '#1E3A5F', secondary: '#4A6274', accent: '#C5A572', background: '#F8F9FA', surface: '#FFFFFF', text: '#0D1B2A' },
  construction: { primary: '#5C7A4A', secondary: '#8B7355', accent: '#C4A882', background: '#F8F6F1', surface: '#FFFFFF', text: '#2A2824' },
  'real-estate': { primary: '#3B82F6', secondary: '#14B8A6', accent: '#F59E0B', background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A' },
  photographer: { primary: '#1A1A1A', secondary: '#666666', accent: '#CCCCCC', background: '#FAFAFA', surface: '#FFFFFF', text: '#0A0A0A' },
  'travel-agency': { primary: '#0EA5E9', secondary: '#10B981', accent: '#F59E0B', background: '#F0F9FF', surface: '#FFFFFF', text: '#0C4A6E' },
  school: { primary: '#059669', secondary: '#0284C7', accent: '#F59E0B', background: '#F0FDF4', surface: '#FFFFFF', text: '#052E16' },
  'coaching-institute': { primary: '#7C3AED', secondary: '#EC4899', accent: '#F59E0B', background: '#0A0A1A', surface: '#141428', text: '#F1F5F9' },
  'digital-agency': { primary: '#6366F1', secondary: '#14B8A6', accent: '#F59E0B', background: '#FAFAFA', surface: '#FFFFFF', text: '#18181B' },
};

const FALLBACK_FONTS: Record<string, { heading: string; body: string }> = {
  cafe: { heading: 'Playfair Display', body: 'Inter' },
  restaurant: { heading: 'Playfair Display', body: 'Lora' },
  hotel: { heading: 'Playfair Display', body: 'Lora' },
  gym: { heading: 'Inter', body: 'Inter' },
  salon: { heading: 'Playfair Display', body: 'Inter' },
  hospital: { heading: 'Inter', body: 'Inter' },
  clinic: { heading: 'Inter', body: 'Inter' },
  'law-firm': { heading: 'Playfair Display', body: 'Inter' },
  construction: { heading: 'Inter', body: 'Inter' },
  'real-estate': { heading: 'Inter', body: 'Inter' },
  photographer: { heading: 'Inter', body: 'Inter' },
  'travel-agency': { heading: 'DM Sans', body: 'Inter' },
  school: { heading: 'DM Sans', body: 'Inter' },
  'coaching-institute': { heading: 'Inter', body: 'Inter' },
  'digital-agency': { heading: 'Inter', body: 'Inter' },
};

const FALLBACK_MISSIONS: Record<string, string> = {
  cafe: 'To create a warm, welcoming space where every cup tells a story and every visit feels like coming home.',
  restaurant: 'To craft unforgettable culinary experiences that celebrate the art of fine dining and the joy of shared meals.',
  hotel: 'To provide unparalleled hospitality where every guest feels valued, comfortable, and inspired.',
  gym: 'To empower individuals to transform their lives through fitness, fostering a community of strength and resilience.',
  salon: 'To enhance natural beauty and boost confidence through exceptional styling and wellness services.',
  hospital: 'To deliver compassionate, world-class healthcare that puts patients first and heals with dignity.',
  clinic: 'To provide accessible, personalized healthcare that makes every patient feel seen, heard, and cared for.',
  'law-firm': 'To protect clients\' rights and interests with unwavering dedication, integrity, and legal excellence.',
  construction: 'To build structures that stand the test of time, combining quality craftsmanship with visionary design.',
  'real-estate': 'To help people find not just properties, but places to call home, with expertise and genuine care.',
  photographer: 'To capture life\'s most precious moments with artistry, emotion, and timeless beauty.',
  'travel-agency': 'To turn travel dreams into reality by crafting extraordinary journeys that create lifelong memories.',
  school: 'To nurture curious minds and inspire a lifelong love of learning in a safe, supportive environment.',
  'coaching-institute': 'To unlock every student\'s potential through expert guidance, personalized mentorship, and proven methodologies.',
  'digital-agency': 'To drive digital innovation that transforms businesses and creates measurable impact.',
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 99, g: 102, b: 241 };
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `#${['r','g','b'].map(c => Math.min(255, Math.round(({[c]:r,'g':g,'b':b})[c] + (255 - ({[c]:r,'g':g,'b':b})[c]) * amount)).toString(16).padStart(2,'0')).join('')}`;
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `#${['r','g','b'].map(c => Math.max(0, Math.round(({[c]:r,'g':g,'b':b})[c] * (1 - amount))).toString(16).padStart(2,'0')).join('')}`;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export class TemplateEngine {
  private aiClient: AIClient;
  private imageService: ImageService;
  private tokenUsage: TokenUsageService;
  private credits: AICreditService;

  constructor(_aiService?: any) {
    this.aiClient = AIClient.getInstance();
    this.imageService = new ImageService();
    this.tokenUsage = new TokenUsageService();
    this.credits = new AICreditService();
  }

  async generatePlan(
    businessName: string,
    category: string,
    location: string,
    phone: string,
    email: string,
    description?: string,
    theme?: string,
    userId?: string,
    websiteId?: string,
    primaryColor?: string,
    secondaryColor?: string,
    targetAudience?: string,
    tone?: string,
    websiteStyle?: string
  ): Promise<AiGeneratedWebsite> {
    const uid = userId || 'system';
    const industryKey = this.resolveIndustry(category);

    const creditResult = await this.credits.consumeCredits(uid, AITaskType.WEBSITE_GENERATION, websiteId);
    if (!creditResult.success) {
      const err = `Insufficient AI credits. Required: ${creditResult.cost}, Available: ${creditResult.remaining}`;
      emitToUser(uid, 'ai:error', { websiteId, taskType: 'website-generation', error: err });
      throw new Error(err);
    }

    const { AIOrchestrator } = await import('./pipeline/AIOrchestrator');
    const orchestrator = new AIOrchestrator();

    const generatedWebsite = await orchestrator.generateWebsite(
      uid,
      websiteId || 'temp',
      businessName,
      category,
      location,
      phone,
      email,
      description || '',
      theme || 'modern',
      primaryColor,
      secondaryColor,
      targetAudience,
      tone,
      websiteStyle
    );

    // After pipeline generation, we still apply enrichment for images
    const enriched = this.enrichWithImages(generatedWebsite, industryKey);

    return enriched;
  }

  private buildUserPrompt(
    businessName: string,
    category: string,
    location: string,
    description?: string,
    primaryColor?: string,
    secondaryColor?: string,
    targetAudience?: string,
    tone?: string,
    websiteStyle?: string,
    theme?: string
  ): string {
    const desc = description || `A premier ${category.replace(/-/g, ' ')} serving the ${location} community with exceptional service and quality.`;
    const style = websiteStyle || theme || 'Modern';
    const tone_value = tone || 'Professional';
    const audience = targetAudience || 'Local customers and businesses';
    const primary = primaryColor || '#6366F1';
    const secondary = secondaryColor || '#14B8A6';

    return USER_PROMPT_TEMPLATE
      .replace(/{{businessName}}/g, businessName)
      .replace(/{{category}}/g, category.replace(/-/g, ' '))
      .replace(/{{location}}/g, location)
      .replace(/{{description}}/g, desc)
      .replace(/{{style}}/g, style)
      .replace(/{{tone}}/g, tone_value)
      .replace(/{{primaryColor}}/g, primary)
      .replace(/{{secondaryColor}}/g, secondary)
      .replace(/{{audience}}/g, audience);
  }

  private autoFill(
    parsed: any,
    businessName: string,
    category: string,
    location: string,
    phone: string,
    email: string,
    description: string
  ): any {
    const city = location.split(',')[0].trim();
    const cat = category.replace(/-/g, ' ');

    if (!parsed.branding) parsed.branding = {};
    parsed.branding.businessName = parsed.branding.businessName || businessName;
    parsed.branding.tagline = parsed.branding.tagline || `Premium ${cat} Services in ${city}`;
    parsed.branding.description = parsed.branding.description || description.slice(0, 150);
    parsed.branding.logoPrompt = parsed.branding.logoPrompt || `A professional ${cat} logo with modern design, clean typography, and ${parsed.branding.primaryColor || '#6366F1'} as the primary color`;
    parsed.branding.primaryColor = parsed.branding.primaryColor || '#6366F1';
    parsed.branding.secondaryColor = parsed.branding.secondaryColor || '#14B8A6';
    parsed.branding.fontHeading = parsed.branding.fontHeading || 'Inter';
    parsed.branding.fontBody = parsed.branding.fontBody || 'Inter';

    if (!parsed.navigation || parsed.navigation.length === 0) {
      parsed.navigation = [
        { label: 'Home', href: '#home' },
        { label: 'About', href: '#about' },
        { label: 'Services', href: '#services' },
        { label: 'Testimonials', href: '#testimonials' },
        { label: 'Contact', href: '#contact' },
      ];
    }

    if (!parsed.hero) parsed.hero = {};
    parsed.hero.title = parsed.hero.title || `Welcome to ${businessName} – Premier ${cat} in ${city}`;
    parsed.hero.subtitle = parsed.hero.subtitle || `Discover exceptional ${cat} services tailored to your needs. We combine expertise with passion to deliver outstanding results every time.`;
    parsed.hero.ctaText = parsed.hero.ctaText || 'Get Started';
    parsed.hero.ctaLink = parsed.hero.ctaLink || '#contact';
    parsed.hero.badge = parsed.hero.badge || `Trusted by the ${city} community`;
    parsed.hero.backgroundType = parsed.hero.backgroundType || 'image';
    parsed.hero.layout = parsed.hero.layout || 'centered';

    if (!parsed.about) parsed.about = {};
    parsed.about.title = parsed.about.title || `About ${businessName}`;
    parsed.about.content = parsed.about.content || `${businessName} is a premier ${cat} provider based in ${city}, dedicated to delivering exceptional service and outstanding results to every client.\n\nFounded with a passion for excellence, our team brings years of industry experience and a commitment to quality that sets us apart. We believe in building lasting relationships through transparent communication, personalized solutions, and unwavering attention to detail.`;
    parsed.about.mission = parsed.about.mission || `To provide exceptional ${cat} services that exceed expectations.`;
    parsed.about.vision = parsed.about.vision || `To be the most trusted ${cat} provider in ${city}.`;

    if (!parsed.services || parsed.services.length === 0) {
      parsed.services = [
        { title: `Professional ${cat} Consultation`, description: `Comprehensive consultation services tailored to your unique needs. Our experts take the time to understand your requirements and develop a customized plan.`, icon: 'star', features: ['In-depth needs assessment', 'Customized strategy', 'Expert recommendations', 'Follow-up support'], price: '', period: '', cta: 'Learn More' },
        { title: `Premium ${cat} Service`, description: `High-quality service delivered with precision and care. We use the latest techniques and best practices to ensure exceptional results.`, icon: 'shield', features: ['Quality assured', 'Timely delivery', 'Ongoing support', 'Satisfaction guaranteed'], price: '', period: '', cta: 'Learn More' },
        { title: `Custom ${cat} Solutions`, description: `Tailored solutions designed to address your specific challenges and goals. Every project is unique, and we treat it that way.`, icon: 'zap', features: ['Custom approach', 'Flexible options', 'Results focused', 'Continuous improvement'], price: '', period: '', cta: 'Learn More' },
        { title: `${cat} Support & Maintenance`, description: `Reliable ongoing support to keep everything running smoothly. Our team is always available when you need us.`, icon: 'heart', features: ['24/7 availability', 'Rapid response', 'Proactive maintenance', 'Dedicated support'], price: '', period: '', cta: 'Learn More' },
      ];
    }

    if (!parsed.features || parsed.features.length === 0) {
      parsed.features = [
        { title: 'Experienced Team', description: `Our team brings years of ${cat} expertise to every project.`, icon: 'users' },
        { title: 'Quality Commitment', description: 'We never compromise on quality and excellence.', icon: 'shield' },
        { title: 'Customer First', description: 'Your satisfaction is our top priority.', icon: 'heart' },
        { title: 'Innovation Driven', description: 'We stay ahead with the latest industry practices.', icon: 'zap' },
      ];
    }

    if (!parsed.benefits || parsed.benefits.length === 0) {
      parsed.benefits = [
        { title: 'Save Time & Money', description: `Efficient ${cat} solutions that deliver maximum value for your investment.` },
        { title: 'Expert Guidance', description: 'Professional advice and support throughout your journey with us.' },
        { title: 'Peace of Mind', description: 'Reliable service you can count on, backed by our satisfaction guarantee.' },
      ];
    }

    if (!parsed.stats || parsed.stats.length === 0) {
      parsed.stats = [
        { value: '500+', label: 'Happy Clients', icon: 'users' },
        { value: '10+', label: 'Years Experience', icon: 'clock' },
        { value: '98%', label: 'Satisfaction Rate', icon: 'trending-up' },
      ];
    }

    if (!parsed.pricing || parsed.pricing.length === 0) {
      parsed.pricing = [
        { title: 'Starter', price: '$99', period: '/month', description: 'Perfect for getting started with essential features.', features: ['Core feature access', 'Basic support', 'Standard setup', 'Monthly reports'], cta: 'Get Started', featured: false },
        { title: 'Professional', price: '$199', period: '/month', description: 'Best for growing businesses needing more power.', features: ['All Starter features', 'Priority support', 'Advanced analytics', 'Custom integrations', 'Dedicated account manager'], cta: 'Choose Plan', featured: true },
        { title: 'Enterprise', price: '$499', period: '/month', description: 'For established businesses requiring full customization.', features: ['All Professional features', '24/7 phone support', 'Custom development', 'SLA guarantee', 'Team training', 'API access'], cta: 'Contact Us', featured: false },
      ];
    }

    if (!parsed.testimonials || parsed.testimonials.length === 0) {
      parsed.testimonials = [
        { name: 'Sarah Johnson', role: 'Business Owner', company: '', content: `Working with ${businessName} has been transformative for our business. Their attention to detail and commitment to excellence is unmatched.`, rating: 5, avatar: '' },
        { name: 'Michael Chen', role: 'Operations Manager', company: '', content: `The team at ${businessName} delivered beyond our expectations. Professional, responsive, and truly dedicated to client success.`, rating: 5, avatar: '' },
        { name: 'Priya Patel', role: 'CEO', company: '', content: `We've seen a 40% improvement in our outcomes since partnering with ${businessName}. Their expertise in ${cat} is exceptional.`, rating: 5, avatar: '' },
      ];
    }

    if (!parsed.faq || parsed.faq.length === 0) {
      parsed.faq = [
        { question: 'What services does your company offer?', answer: `We provide comprehensive ${cat} solutions tailored to meet the unique needs of each client. Our services range from initial consultation to full implementation and ongoing support.` },
        { question: 'How can I get started?', answer: `Getting started is easy. Simply contact us through our website, give us a call, or send us an email. We'll schedule a free consultation to discuss your needs.` },
        { question: 'What areas do you serve?', answer: `We proudly serve clients throughout ${city} and the surrounding areas. Contact us to check availability for your specific location.` },
        { question: 'How long does a typical project take?', answer: `Project timelines vary based on scope and complexity. During your initial consultation, we'll provide a detailed timeline and keep you updated every step of the way.` },
        { question: 'Do you offer ongoing support?', answer: `Yes, we provide comprehensive ongoing support to ensure your continued success. Our support team is available to assist with any questions or concerns.` },
      ];
    }

    if (!parsed.team || parsed.team.length === 0) {
      parsed.team = [
        { name: 'Alex Rodriguez', role: 'Founder & CEO', bio: `Visionary leader with over 15 years of experience in the ${cat} industry.`, avatar: '' },
        { name: 'Emily Watson', role: 'Operations Director', bio: 'Ensuring excellence in every project we deliver.', avatar: '' },
      ];
    }

    if (!parsed.gallery || parsed.gallery.length === 0) {
      parsed.gallery = [
        { src: '', alt: `${businessName} main office`, caption: 'Our welcoming workspace' },
        { src: '', alt: `${businessName} team`, caption: 'Our dedicated team at work' },
        { src: '', alt: `${businessName} facility`, caption: 'State-of-the-art facility' },
        { src: '', alt: `${businessName} workspace`, caption: 'Modern workspace designed for creativity' },
      ];
    }

    if (!parsed.process || parsed.process.length === 0) {
      parsed.process = [
        { title: 'Discovery', description: 'We learn about your needs and goals through a detailed consultation.', icon: 'search' },
        { title: 'Planning', description: 'We create a customized strategy tailored to your requirements.', icon: 'file-text' },
        { title: 'Execution', description: 'Our expert team brings the plan to life with precision and care.', icon: 'zap' },
      ];
    }

    if (!parsed.cta) parsed.cta = {};
    parsed.cta.title = parsed.cta.title || 'Ready to Get Started?';
    parsed.cta.subtitle = parsed.cta.subtitle || `Let ${businessName} help you achieve your goals. Contact us today for a free consultation.`;
    parsed.cta.buttonText = parsed.cta.buttonText || 'Contact Us Today';
    parsed.cta.buttonLink = parsed.cta.buttonLink || '#contact';
    parsed.cta.backgroundType = parsed.cta.backgroundType || 'gradient';

    if (!parsed.contact) parsed.contact = {};
    parsed.contact.phone = parsed.contact.phone || phone || `+1 (555) 123-4567`;
    parsed.contact.email = parsed.contact.email || email || `hello@${slugify(businessName)}.com`;
    parsed.contact.address = parsed.contact.address || `${businessName}, ${location}`;
    if (!parsed.contact.socialLinks || parsed.contact.socialLinks.length === 0) {
      parsed.contact.socialLinks = [
        { platform: 'Facebook', url: 'https://facebook.com/' },
        { platform: 'Instagram', url: 'https://instagram.com/' },
      ];
    }
    if (!parsed.contact.formFields || parsed.contact.formFields.length === 0) {
      parsed.contact.formFields = [
        { label: 'Name', type: 'text', placeholder: 'Your Name', required: true },
        { label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
        { label: 'Message', type: 'textarea', placeholder: 'How can we help you?', required: true },
      ];
    }

    if (!parsed.footer) parsed.footer = {};
    parsed.footer.description = parsed.footer.description || `${businessName} is a premier ${cat} provider dedicated to delivering exceptional service and outstanding results in ${city}.`;
    parsed.footer.copyright = parsed.footer.copyright || `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`;
    if (!parsed.footer.columns || parsed.footer.columns.length === 0) {
      parsed.footer.columns = [
        { title: 'Quick Links', links: [{ label: 'Home', href: '#home' }, { label: 'About', href: '#about' }, { label: 'Services', href: '#services' }, { label: 'Contact', href: '#contact' }] },
        { title: 'Services', links: [{ label: 'Consultation', href: '#services' }, { label: 'Support', href: '#contact' }, { label: 'FAQ', href: '#faq' }] },
        { title: 'Legal', links: [{ label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms of Service', href: '/terms' }] },
      ];
    }
    if (!parsed.footer.socialLinks || parsed.footer.socialLinks.length === 0) {
      parsed.footer.socialLinks = [
        { platform: 'Facebook', url: 'https://facebook.com/' },
        { platform: 'Instagram', url: 'https://instagram.com/' },
      ];
    }
    parsed.footer.showNewsletter = parsed.footer.showNewsletter ?? false;

    if (!parsed.announcement) parsed.announcement = {};
    parsed.announcement.text = parsed.announcement.text || '';
    parsed.announcement.enabled = parsed.announcement.enabled ?? false;

    if (!parsed.newsletter) parsed.newsletter = {};
    parsed.newsletter.title = parsed.newsletter.title || 'Stay Updated';
    parsed.newsletter.description = parsed.newsletter.description || 'Subscribe to our newsletter for the latest updates and offers.';
    parsed.newsletter.placeholder = parsed.newsletter.placeholder || 'Enter your email';
    parsed.newsletter.buttonText = parsed.newsletter.buttonText || 'Subscribe';
    parsed.newsletter.enabled = parsed.newsletter.enabled ?? false;

    if (!parsed.map) parsed.map = {};
    parsed.map.address = parsed.map.address || `${businessName}, ${location}`;
    parsed.map.lat = parsed.map.lat || undefined;
    parsed.map.lng = parsed.map.lng || undefined;
    parsed.map.zoom = parsed.map.zoom || 15;

    if (!parsed.seo) parsed.seo = {};
    parsed.seo.metaTitle = parsed.seo.metaTitle || `${businessName} | Best ${cat} in ${city}`;
    parsed.seo.metaDescription = parsed.seo.metaDescription || `${businessName} offers professional ${cat} services in ${city}. Contact us today for exceptional service and outstanding results.`;
    parsed.seo.keywords = parsed.seo.keywords || [businessName, cat, city, location, 'premium', 'professional'];
    parsed.seo.slug = parsed.seo.slug || slugify(businessName);
    parsed.seo.ogTitle = parsed.seo.ogTitle || parsed.seo.metaTitle;
    parsed.seo.ogDescription = parsed.seo.ogDescription || parsed.seo.metaDescription;
    parsed.seo.canonicalUrl = parsed.seo.canonicalUrl || '';
    parsed.seo.structuredData = parsed.seo.structuredData || {};

    return parsed;
  }

  private mapToAiGeneratedWebsite(
    parsed: any,
    businessName: string,
    category: string,
    industryKey: string
  ): AiGeneratedWebsite {
    const fc = FALLBACK_COLORS[industryKey] || FALLBACK_COLORS['digital-agency'];
    const ff = FALLBACK_FONTS[industryKey] || FALLBACK_FONTS['digital-agency'];
    const mission = FALLBACK_MISSIONS[industryKey] || `To provide exceptional ${industryKey.replace(/-/g, ' ')} services.`;

    const primaryColor = parsed.branding?.primaryColor || fc.primary;
    const secondaryColor = parsed.branding?.secondaryColor || fc.secondary;

    function lightenColor(hex: string, amount: number): string {
      const { r, g, b } = hexToRgb(hex);
      return `#${['r','g','b'].map(c => Math.min(255, Math.round(({[c]:r,'g':g,'b':b})[c] + (255 - ({[c]:r,'g':g,'b':b})[c]) * amount)).toString(16).padStart(2,'0')).join('')}`;
    }

    function darkenColor(hex: string, amount: number): string {
      const { r, g, b } = hexToRgb(hex);
      return `#${['r','g','b'].map(c => Math.max(0, Math.round(({[c]:r,'g':g,'b':b})[c] * (1 - amount))).toString(16).padStart(2,'0')).join('')}`;
    }

    const bgColor = '#FAFAFA';

    return {
      industry: industryKey,
      theme: 'Modern',
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: parsed.branding?.secondaryColor && parsed.branding?.secondaryColor !== secondaryColor ? parsed.branding.secondaryColor : lightenColor(primaryColor, 0.3),
        background: bgColor,
        surface: '#FFFFFF',
        text: '#18181B',
      },
      fonts: {
        heading: parsed.branding?.fontHeading || ff.heading,
        body: parsed.branding?.fontBody || ff.body,
      },
      brand: {
        tagline: parsed.branding?.tagline || `${category.replace(/-/g, ' ')} Excellence`,
        mission: parsed.about?.mission || mission,
        logoStyle: 'wordmark',
        logoPrompt: parsed.branding?.logoPrompt || `A professional ${industryKey} logo with ${primaryColor} as the primary color, clean modern design`,
      },
      announcement: {
        text: parsed.announcement?.text || '',
        enabled: parsed.announcement?.enabled || false,
      },
      navbar: {
        logo: businessName,
        links: parsed.navigation || [
          { label: 'Home', href: '#home' },
          { label: 'About', href: '#about' },
          { label: 'Services', href: '#services' },
          { label: 'Testimonials', href: '#testimonials' },
          { label: 'Contact', href: '#contact' },
        ],
        cta: { text: parsed.hero?.ctaText || 'Get Started', href: parsed.hero?.ctaLink || '#contact' },
        sticky: true,
        variant: 'transparent',
      },
      hero: {
        title: parsed.hero?.title || `Welcome to ${businessName}`,
        subtitle: parsed.hero?.subtitle || `Premier ${category.replace(/-/g, ' ')} services in ${businessName.split(',')[0] || ''}`,
        ctaPrimary: parsed.hero?.ctaText || 'Get Started',
        ctaSecondary: 'Learn More',
        badge: parsed.hero?.badge || '',
        layout: parsed.hero?.layout || 'centered',
        backgroundType: parsed.hero?.backgroundType || 'image',
      },
      about: {
        title: parsed.about?.title || 'About Us',
        content: parsed.about?.content || '',
        image: '',
        stats: parsed.about?.stats || [],
        features: parsed.about?.features || [],
        layout: 'split-right',
      },
      services: {
        title: 'Our Services',
        description: '',
        items: (parsed.services || []).map((s: any) => ({
          title: s.title || 'Service',
          description: s.description || '',
          icon: s.icon || 'star',
          features: s.features || [],
          price: s.price || '',
          period: s.period || '',
          featured: s.featured || false,
          cta: s.cta || 'Learn More',
        })),
        layout: 'grid-3',
      },
      features: {
        title: 'Why Choose Us',
        description: `What sets ${businessName} apart from the competition.`,
        items: (parsed.features || []).map((f: any) => ({
          title: f.title || 'Feature',
          description: f.description || '',
          icon: f.icon || 'check-circle',
        })),
        columns: 3,
      },
      stats: (parsed.stats || []).map((s: any) => ({
        value: s.value || '100+',
        label: s.label || 'Clients',
        icon: s.icon || 'users',
      })),
      portfolio: {
        title: 'Our Work',
        description: '',
        items: [],
        layout: 'grid',
      },
      pricing: {
        title: 'Pricing Plans',
        description: 'Choose the perfect plan for your needs.',
        items: (parsed.pricing || []).map((p: any) => ({
          title: p.title || 'Plan',
          price: p.price || '$0',
          period: p.period || '',
          description: p.description || '',
          features: p.features || [],
          cta: p.cta || 'Choose Plan',
          featured: p.featured || false,
          icon: p.icon || 'zap',
        })),
      },
      gallery: {
        title: 'Gallery',
        description: `A glimpse into ${businessName}.`,
        images: (parsed.gallery || []).map((g: any) => ({
          src: g.src || '',
          alt: g.alt || `${businessName} image`,
          caption: g.caption || undefined,
        })),
        layout: 'grid',
      },
      testimonials: {
        title: 'What Our Clients Say',
        description: 'Hear from our satisfied customers.',
        items: (parsed.testimonials || []).map((t: any) => ({
          name: t.name || 'Client',
          role: t.role || 'Customer',
          company: t.company || '',
          content: t.content || '',
          rating: t.rating || 5,
          avatar: t.avatar || '',
        })),
        layout: 'carousel',
      },
      faq: {
        title: 'Frequently Asked Questions',
        description: '',
        items: (parsed.faq || []).map((f: any) => ({
          question: f.question || '',
          answer: f.answer || '',
        })),
        layout: 'accordion',
      },
      process: {
        title: 'How It Works',
        description: 'Our simple process to get you started.',
        steps: (parsed.process || []).map((p: any) => ({
          title: p.title || 'Step',
          description: p.description || '',
          icon: p.icon || 'arrow-right',
        })),
      },
      team: {
        title: 'Meet Our Team',
        description: 'The passionate people behind our success.',
        members: (parsed.team || []).map((m: any) => ({
          name: m.name || 'Team Member',
          role: m.role || 'Team Member',
          bio: m.bio || '',
          avatar: m.avatar || '',
        })),
      },
      cta: {
        title: parsed.cta?.title || 'Ready to Get Started?',
        subtitle: parsed.cta?.subtitle || `Let ${businessName} help you achieve your goals. Contact us today.`,
        buttonText: parsed.cta?.buttonText || 'Contact Us',
        buttonLink: parsed.cta?.buttonLink || '#contact',
        backgroundType: parsed.cta?.backgroundType || 'gradient',
      },
      contact: {
        title: 'Get In Touch',
        description: `We'd love to hear from you. Reach out to ${businessName} today.`,
        phone: parsed.contact?.phone || '',
        email: parsed.contact?.email || '',
        address: parsed.contact?.address || '',
        mapUrl: parsed.contact?.address ? `https://www.google.com/maps?q=${encodeURIComponent(parsed.contact.address)}` : '',
        socialLinks: (parsed.contact?.socialLinks || []).map((s: any) => ({
          platform: s.platform || 'Facebook',
          url: s.url || 'https://facebook.com/',
          icon: (s.platform || 'facebook').toLowerCase(),
        })),
        formFields: parsed.contact?.formFields || [
          { label: 'Name', type: 'text', placeholder: 'Your Name', required: true },
          { label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
          { label: 'Message', type: 'textarea', placeholder: 'Your Message', required: true },
        ],
      },
      newsletter: {
        title: parsed.newsletter?.title || 'Stay Updated',
        description: parsed.newsletter?.description || 'Subscribe to our newsletter for the latest updates.',
        placeholder: parsed.newsletter?.placeholder || 'Enter your email',
        buttonText: parsed.newsletter?.buttonText || 'Subscribe',
        enabled: parsed.newsletter?.enabled ?? false,
      },
      map: {
        title: 'Find Us',
        address: parsed.map?.address || '',
        lat: parsed.map?.lat,
        lng: parsed.map?.lng,
        zoom: parsed.map?.zoom || 15,
      },
      footer: {
        description: parsed.footer?.description || '',
        copyright: parsed.footer?.copyright || `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
        columns: (parsed.footer?.columns || []).map((c: any) => ({
          title: c.title || 'Links',
          links: (c.links || []).map((l: any) => ({ label: l.label || 'Link', href: l.href || '#' })),
        })),
        socialLinks: (parsed.footer?.socialLinks || []).map((s: any) => ({
          platform: s.platform || 'Facebook',
          url: s.url || 'https://facebook.com/',
          icon: (s.platform || 'facebook').toLowerCase(),
        })),
        showNewsletter: parsed.footer?.showNewsletter ?? false,
      },
      seo: {
        metaTitle: (parsed.seo?.metaTitle || `${businessName} | Best ${category.replace(/-/g, ' ')}`).slice(0, 70),
        metaDescription: (parsed.seo?.metaDescription || `${businessName} offers professional ${category.replace(/-/g, ' ')} services. Contact us today.`).slice(0, 160),
        keywords: parsed.seo?.keywords || [businessName, category, 'premium'],
        ogImage: '',
        twitterCard: 'summary_large_image',
      },
      layout: [
        { type: 'announcement', variant: 'default' },
        { type: 'navbar', variant: 'transparent' },
        { type: 'hero', variant: parsed.hero?.layout || 'centered' },
        { type: 'about', variant: 'split-right' },
        { type: 'features', variant: 'grid-3' },
        { type: 'services', variant: 'grid-3' },
        { type: 'stats', variant: 'grid-4' },
        { type: 'gallery', variant: 'grid' },
        { type: 'testimonials', variant: 'carousel' },
        { type: 'process', variant: 'steps' },
        { type: 'team', variant: 'grid' },
        { type: 'pricing', variant: 'cards' },
        { type: 'faq', variant: 'accordion' },
        { type: 'cta', variant: 'centered' },
        { type: 'contact', variant: 'split' },
        { type: 'newsletter', variant: 'default' },
        { type: 'map', variant: 'full' },
        { type: 'footer', variant: 'columns' },
      ],
    };
  }

  private enrichWithImages(plan: AiGeneratedWebsite, industry: string): AiGeneratedWebsite {
    const images = this.imageService.getImages(industry);
    const enriched = { ...plan };

    if (!enriched.gallery) enriched.gallery = { title: 'Gallery', description: '', images: [] };
    if (!enriched.gallery.images) enriched.gallery.images = [];

    if (enriched.gallery.images.length === 0) {
      enriched.gallery.images = images.gallery.map((src, i) => ({
        src,
        alt: `${industry.replace(/-/g, ' ')} image ${i + 1}`,
      }));
    }

    if (!enriched.team) enriched.team = { title: 'Our Team', description: '', members: [] };
    if (!enriched.team.members) enriched.team.members = [];

    if (enriched.team.members.length > 0) {
      enriched.team.members = enriched.team.members.map((m, i) => ({
        ...m,
        avatar: m.avatar || `https://i.pravatar.cc/300?img=${(i % 70) + 1}`,
      }));
    }

    if (!enriched.testimonials) enriched.testimonials = { title: 'Testimonials', items: [] };
    if (!enriched.testimonials.items) enriched.testimonials.items = [];

    if (enriched.testimonials.items.length > 0) {
      enriched.testimonials.items = enriched.testimonials.items.map((t, i) => ({
        ...t,
        avatar: t.avatar || `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
      }));
    }

    if (!enriched.portfolio) enriched.portfolio = { title: 'Portfolio', description: '', items: [] };
    if (!enriched.portfolio.items) enriched.portfolio.items = [];

    if (enriched.portfolio.items.length === 0 && images.portfolio.length > 0) {
      enriched.portfolio.items = images.portfolio.slice(0, 6).map((src, i) => ({
        title: `Project ${i + 1}`,
        category: industry.replace(/-/g, ' '),
        image: src,
      }));
    }

    return enriched;
  }

  resolveIndustry(category: string): string {
    const normalized = category.toLowerCase().trim();
    const known = Object.keys(FALLBACK_COLORS);
    if (known.includes(normalized)) return normalized;
    if (normalized.includes('cafe') || normalized.includes('coffee')) return 'cafe';
    if (normalized.includes('restaurant') || normalized.includes('food')) return 'restaurant';
    if (normalized.includes('hotel') || normalized.includes('resort')) return 'hotel';
    if (normalized.includes('gym') || normalized.includes('fitness')) return 'gym';
    if (normalized.includes('salon') || normalized.includes('spa') || normalized.includes('beauty')) return 'salon';
    if (normalized.includes('hospital') || normalized.includes('health')) return 'hospital';
    if (normalized.includes('clinic') || normalized.includes('medical')) return 'clinic';
    if (normalized.includes('law') || normalized.includes('legal') || normalized.includes('attorney')) return 'law-firm';
    if (normalized.includes('construction') || normalized.includes('contractor')) return 'construction';
    if (normalized.includes('real estate') || normalized.includes('property') || normalized.includes('realtor')) return 'real-estate';
    if (normalized.includes('photo') || normalized.includes('photography')) return 'photographer';
    if (normalized.includes('travel') || normalized.includes('tour') || normalized.includes('tourism')) return 'travel-agency';
    if (normalized.includes('school') || normalized.includes('education') || normalized.includes('academy')) return 'school';
    if (normalized.includes('coach') || normalized.includes('tutor') || normalized.includes('training') || normalized.includes('institute')) return 'coaching-institute';
    if (normalized.includes('digital') || normalized.includes('agency') || normalized.includes('marketing') || normalized.includes('software') || normalized.includes('tech') || normalized.includes('startup')) return 'digital-agency';
    if (normalized.includes('interior') || normalized.includes('design')) return 'digital-agency';
    if (normalized.includes('portfolio')) return 'digital-agency';
    return 'digital-agency';
  }
}

export type { AiGeneratedWebsite };
