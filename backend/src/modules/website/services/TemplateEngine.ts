import { Logger } from '../../../core/logging/Logger';
import { AIEngineService } from '../../ai/services/AIEngineService';
import { AITaskType, AICompletionRequest, AICompletionResponse } from '../../ai/types';
import type { AiGeneratedWebsite } from '../../../types/website';
import { ImageService } from './ImageService';

const AI_SYSTEM_PROMPT = `You are an expert website designer and brand strategist. You create complete, production-ready business websites.

Generate a complete website plan as VALID JSON. NEVER use markdown, code fences, or explanations.

Every website must include ALL sections below. Make each section feel unique to the specific business and industry.

CRITICAL RULES:
- NEVER use "Lorem Ipsum" or placeholder text
- Generate realistic, specific, detailed content
- Every testimonial must sound authentic with specific details
- Every FAQ must have detailed, helpful answers
- Service descriptions must be 2-3 compelling sentences
- Make the brand identity feel cohesive and professional
- Choose fonts that pair well together (heading + body)
- Generate logoPrompt that could feed into an AI image generator
- Each section's "layout" should match the content (grid-3, grid-4, list, card, menu, pricing, etc.)

Return this EXACT JSON structure:`;

const AI_USER_PROMPT_TEMPLATE = `Business Name: {{businessName}}
Industry/Category: {{category}}
Location: {{location}}
Description: {{description}}
Phone: {{phone}}
Email: {{email}}
Theme Preference: {{theme}}

Generate a complete, production-ready website for this business. Make the content specific, detailed, and realistic.`;

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

const FALLBACK_VOICES: Record<string, string> = {
  cafe: 'warm and inviting', restaurant: 'sophisticated and elegant', hotel: 'luxurious and welcoming',
  gym: 'energetic and motivational', salon: 'elegant and pampering', hospital: 'professional and compassionate',
  clinic: 'warm and caring', 'law-firm': 'authoritative and trustworthy', construction: 'reliable and robust',
  'real-estate': 'professional and aspirational', photographer: 'artistic and creative',
  'travel-agency': 'adventurous and exciting', school: 'nurturing and inspiring',
  'coaching-institute': 'motivational and results-driven', 'digital-agency': 'innovative and forward-thinking',
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

function getBrandColor(hex: string): string {
  return hex || '#6366F1';
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 99, g: 102, b: 241 };
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const lighten = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount));
  return `#${lighten(r).toString(16).padStart(2, '0')}${lighten(g).toString(16).padStart(2, '0')}${lighten(b).toString(16).padStart(2, '0')}`;
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const darken = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
  return `#${darken(r).toString(16).padStart(2, '0')}${darken(g).toString(16).padStart(2, '0')}${darken(b).toString(16).padStart(2, '0')}`;
}

export class TemplateEngine {
  private aiService: AIEngineService;
  private imageService: ImageService;

  constructor(aiService?: AIEngineService) {
    this.aiService = aiService || new AIEngineService();
    this.imageService = new ImageService();
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
    websiteId?: string
  ): Promise<AiGeneratedWebsite> {
    const industryKey = this.resolveIndustry(category);

    try {
      const aiResult = await this.tryAiGeneration(businessName, industryKey, location, phone, email, description, theme, userId || 'system', websiteId);
      if (aiResult) {
        return this.enrichWithImages(aiResult, industryKey);
      }
    } catch (error) {
      Logger.warn('AI generation failed, using fallback', { error: (error as Error).message, businessName });
    }

    return this.generateFallback(businessName, industryKey, location, phone, email, description, theme);
  }

  private async tryAiGeneration(
    businessName: string,
    category: string,
    location: string,
    phone: string,
    email: string,
    description: string | undefined,
    theme: string | undefined,
    userId: string,
    websiteId?: string
  ): Promise<AiGeneratedWebsite | null> {
    const userPrompt = AI_USER_PROMPT_TEMPLATE
      .replace('{{businessName}}', businessName)
      .replace('{{category}}', category.replace(/-/g, ' '))
      .replace('{{location}}', location)
      .replace('{{description}}', description || 'A professional business serving the local community.')
      .replace('{{phone}}', phone)
      .replace('{{email}}', email)
      .replace('{{theme}}', theme || 'Modern');

    const systemPrompt = AI_SYSTEM_PROMPT + '\n' + this.getFullJsonStructure();

    const request: AICompletionRequest = {
      taskType: AITaskType.WEBSITE_GENERATION,
      userId,
      websiteId,
      systemPrompt,
      userPrompt,
      temperature: 0.75,
      maxTokens: 6000,
      responseFormat: 'json_object',
    };

    const response: AICompletionResponse = await this.aiService.generate(request, false);

    if (!response?.content) return null;

    const cleaned = response.content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return this.mergeWithDefaults(parsed, category);
  }

  private getFullJsonStructure(): string {
    return `
{
  "industry": "string",
  "theme": "string",
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "surface": "#hex",
    "text": "#hex"
  },
  "fonts": { "heading": "string", "body": "string" },
  "brand": {
    "tagline": "string (short, catchy, mentions location)",
    "mission": "string (one sentence)",
    "logoStyle": "emblem|wordmark|wordmark-bold|script|minimal",
    "logoPrompt": "string (detailed prompt for AI image generation, describe style, colors, business type, mood)"
  },
  "announcement": { "text": "string (promotional)", "enabled": true },
  "navbar": {
    "logo": "string (business name)",
    "links": [{ "label": "Home", "href": "#home" }],
    "cta": { "text": "string", "href": "#contact" },
    "sticky": true,
    "variant": "transparent|solid-light|solid-dark"
  },
  "hero": {
    "title": "string (powerful headline with business name)",
    "subtitle": "string (compelling value proposition)",
    "ctaPrimary": "string (action-oriented)",
    "ctaSecondary": "string",
    "badge": "string (trust signal like 'Trusted since 2015')",
    "layout": "centered|split|minimal|fullscreen|overlay",
    "backgroundType": "image|gradient|video"
  },
  "about": {
    "title": "string",
    "content": "string (2-3 paragraphs about history, values, team, separated by \\n)",
    "image": "string",
    "stats": [{ "value": "15+", "label": "Years Experience" }],
    "features": ["string (key differentiators)"],
    "layout": "split-right|split-left|centered|story-telling|stats-focused"
  },
  "services": {
    "title": "string",
    "description": "string",
    "items": [{
      "title": "string",
      "description": "string (2-3 compelling sentences)",
      "icon": "string (section-specific icon name)",
      "features": ["string"],
      "price": "string (optional)",
      "period": "string (optional, e.g. /month)",
      "featured": false,
      "cta": "string (optional)"
    }],
    "layout": "grid-3|grid-4|list|card|menu|pricing"
  },
  "features": {
    "title": "string",
    "description": "string",
    "items": [{ "title": "string", "description": "string", "icon": "string" }],
    "columns": 3
  },
  "stats": [{ "value": "500+", "label": "Clients Served", "icon": "string" }],
  "portfolio": {
    "title": "string",
    "description": "string",
    "items": [{ "title": "string", "category": "string", "image": "string", "link": "string (optional)" }],
    "layout": "grid|masonry|carousel"
  },
  "pricing": {
    "title": "string",
    "description": "string",
    "items": [{
      "title": "string", "price": "string", "period": "string",
      "description": "string", "features": ["string"],
      "cta": "string", "featured": false, "icon": "string"
    }]
  },
  "gallery": {
    "title": "string",
    "description": "string",
    "images": [{ "src": "string", "alt": "string", "caption": "string (optional)" }],
    "layout": "grid|masonry|carousel|showcase"
  },
  "testimonials": {
    "title": "string",
    "description": "string",
    "items": [{
      "name": "string (realistic full name)",
      "role": "string",
      "company": "string (optional)",
      "content": "string (specific, detailed review with measurable results)",
      "rating": 5,
      "avatar": "string"
    }],
    "layout": "carousel|grid-2|grid-3|single-featured"
  },
  "faq": {
    "title": "string",
    "description": "string",
    "items": [{ "question": "string", "answer": "string (detailed, helpful)" }],
    "layout": "compact|full|accordion"
  },
  "process": {
    "title": "How It Works",
    "description": "string",
    "steps": [{ "title": "string", "description": "string", "icon": "string" }]
  },
  "team": {
    "title": "string",
    "description": "string",
    "members": [{ "name": "string", "role": "string", "bio": "string", "avatar": "string" }]
  },
  "cta": {
    "title": "string",
    "subtitle": "string",
    "buttonText": "string",
    "buttonLink": "#contact",
    "backgroundType": "gradient|solid|image"
  },
  "contact": {
    "title": "string",
    "description": "string",
    "phone": "string",
    "email": "string",
    "address": "string",
    "mapUrl": "string",
    "socialLinks": [{ "platform": "string", "url": "string", "icon": "string" }],
    "formFields": [{ "label": "string", "type": "text|email|tel|textarea", "placeholder": "string", "required": true }]
  },
  "newsletter": {
    "title": "string",
    "description": "string",
    "placeholder": "string",
    "buttonText": "string",
    "enabled": true
  },
  "map": {
    "title": "Find Us",
    "address": "string",
    "lat": 0, "lng": 0, "zoom": 15
  },
  "footer": {
    "description": "string (compelling brand summary)",
    "copyright": "string",
    "columns": [{ "title": "string", "links": [{ "label": "string", "href": "string" }] }],
    "socialLinks": [{ "platform": "string", "url": "string", "icon": "string" }],
    "showNewsletter": false
  },
  "seo": {
    "metaTitle": "string (max 60 chars, include business name and location)",
    "metaDescription": "string (max 160 chars)",
    "keywords": ["string"],
    "ogImage": "string",
    "twitterCard": "summary_large_image"
  },
  "layout": [{ "type": "section-name", "variant": "variant-name" }]
}`;
  }

  private mergeWithDefaults(parsed: any, category: string): AiGeneratedWebsite {
    const industryKey = this.resolveIndustry(category);
    const fallbackColors = FALLBACK_COLORS[industryKey] || FALLBACK_COLORS['digital-agency'];
    const fallbackFonts = FALLBACK_FONTS[industryKey] || FALLBACK_FONTS['digital-agency'];
    const voice = FALLBACK_VOICES[industryKey] || 'professional and dedicated';
    const mission = FALLBACK_MISSIONS[industryKey] || `To provide exceptional ${industryKey.replace(/-/g, ' ')} services.`;

    const colors = parsed.colors || fallbackColors;

    return {
      industry: parsed.industry || industryKey,
      theme: parsed.theme || 'Modern',
      colors: {
        primary: getBrandColor(colors.primary),
        secondary: getBrandColor(colors.secondary),
        accent: getBrandColor(colors.accent),
        background: colors.background || '#FAFAFA',
        surface: colors.surface || '#FFFFFF',
        text: colors.text || '#18181B',
      },
      fonts: {
        heading: parsed.fonts?.heading || fallbackFonts.heading,
        body: parsed.fonts?.body || fallbackFonts.body,
      },
      brand: {
        tagline: parsed.brand?.tagline || `${category.replace(/-/g, ' ')} Excellence`,
        mission: parsed.brand?.mission || mission,
        logoStyle: parsed.brand?.logoStyle || 'wordmark',
        logoPrompt: parsed.brand?.logoPrompt || `A professional ${industryKey} logo with ${colors.primary || fallbackColors.primary} as the primary color, clean modern design`,
      },
      announcement: {
        text: parsed.announcement?.text || '',
        enabled: parsed.announcement?.enabled || false,
      },
      navbar: {
        logo: parsed.navbar?.logo || '',
        links: parsed.navbar?.links || [{ label: 'Home', href: '#home' }, { label: 'About', href: '#about' }, { label: 'Services', href: '#services' }, { label: 'Contact', href: '#contact' }],
        cta: parsed.navbar?.cta || null,
        sticky: parsed.navbar?.sticky ?? true,
        variant: parsed.navbar?.variant || 'transparent',
      },
      hero: {
        title: parsed.hero?.title || `Welcome to ${parsed.businessName || 'Our Business'}`,
        subtitle: parsed.hero?.subtitle || 'Delivering excellence with passion and professionalism.',
        ctaPrimary: parsed.hero?.ctaPrimary || 'Get Started',
        ctaSecondary: parsed.hero?.ctaSecondary || 'Learn More',
        badge: parsed.hero?.badge || '',
        layout: parsed.hero?.layout || 'centered',
        backgroundType: parsed.hero?.backgroundType || 'image',
      },
      about: {
        title: parsed.about?.title || 'About Us',
        content: parsed.about?.content || '',
        image: parsed.about?.image || '',
        stats: parsed.about?.stats || [],
        features: parsed.about?.features || [],
        layout: parsed.about?.layout || 'split-right',
      },
      services: {
        title: parsed.services?.title || 'Our Services',
        description: parsed.services?.description || '',
        items: parsed.services?.items || [],
        layout: parsed.services?.layout || 'grid-3',
      },
      features: {
        title: parsed.features?.title || 'Why Choose Us',
        description: parsed.features?.description || '',
        items: parsed.features?.items || [],
        columns: parsed.features?.columns || 3,
      },
      stats: parsed.stats || [],
      portfolio: {
        title: parsed.portfolio?.title || 'Our Work',
        description: parsed.portfolio?.description || '',
        items: parsed.portfolio?.items || [],
        layout: parsed.portfolio?.layout || 'grid',
      },
      pricing: {
        title: parsed.pricing?.title || 'Pricing Plans',
        description: parsed.pricing?.description || '',
        items: parsed.pricing?.items || [],
      },
      gallery: {
        title: parsed.gallery?.title || 'Gallery',
        description: parsed.gallery?.description || '',
        images: parsed.gallery?.images || [],
        layout: parsed.gallery?.layout || 'grid',
      },
      testimonials: {
        title: parsed.testimonials?.title || 'What Our Clients Say',
        description: parsed.testimonials?.description || '',
        items: parsed.testimonials?.items || [],
        layout: parsed.testimonials?.layout || 'carousel',
      },
      faq: {
        title: parsed.faq?.title || 'Frequently Asked Questions',
        description: parsed.faq?.description || '',
        items: parsed.faq?.items || [],
        layout: parsed.faq?.layout || 'accordion',
      },
      process: {
        title: parsed.process?.title || 'How It Works',
        description: parsed.process?.description || '',
        steps: parsed.process?.steps || [],
      },
      team: {
        title: parsed.team?.title || 'Our Team',
        description: parsed.team?.description || '',
        members: parsed.team?.members || [],
      },
      cta: {
        title: parsed.cta?.title || 'Ready to Get Started?',
        subtitle: parsed.cta?.subtitle || 'Let\'s work together to achieve your goals.',
        buttonText: parsed.cta?.buttonText || 'Contact Us Today',
        buttonLink: parsed.cta?.buttonLink || '#contact',
        backgroundType: parsed.cta?.backgroundType || 'gradient',
      },
      contact: {
        title: parsed.contact?.title || 'Get In Touch',
        description: parsed.contact?.description || '',
        phone: parsed.contact?.phone || '',
        email: parsed.contact?.email || '',
        address: parsed.contact?.address || '',
        mapUrl: parsed.contact?.mapUrl || '',
        socialLinks: parsed.contact?.socialLinks || [],
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
        title: parsed.map?.title || 'Find Us',
        address: parsed.map?.address || '',
        lat: parsed.map?.lat,
        lng: parsed.map?.lng,
        zoom: parsed.map?.zoom || 15,
      },
      footer: {
        description: parsed.footer?.description || '',
        copyright: parsed.footer?.copyright || '',
        columns: parsed.footer?.columns || [],
        socialLinks: parsed.footer?.socialLinks || [],
        showNewsletter: parsed.footer?.showNewsletter ?? false,
      },
      seo: {
        metaTitle: parsed.seo?.metaTitle || '',
        metaDescription: parsed.seo?.metaDescription || '',
        keywords: parsed.seo?.keywords || [],
        ogImage: parsed.seo?.ogImage || '',
        twitterCard: parsed.seo?.twitterCard || 'summary_large_image',
      },
      layout: parsed.layout || [],
    };
  }

  private enrichWithImages(plan: AiGeneratedWebsite, industry: string): AiGeneratedWebsite {
    const images = this.imageService.getImages(industry);

    const enriched = { ...plan };

    if (enriched.hero && !enriched.hero.title.includes('backgroundImage')) {
      enriched.hero = { ...enriched.hero };
    }

    if (enriched.gallery.images.length === 0) {
      enriched.gallery.images = images.gallery.map((src, i) => ({
        src,
        alt: `${industry.replace(/-/g, ' ')} image ${i + 1}`,
      }));
    }

    if (enriched.team.members.length > 0) {
      enriched.team.members = enriched.team.members.map((m, i) => ({
        ...m,
        avatar: m.avatar || `https://i.pravatar.cc/300?img=${(i % 70) + 1}`,
      }));
    }

    if (enriched.testimonials.items.length > 0) {
      enriched.testimonials.items = enriched.testimonials.items.map((t, i) => ({
        ...t,
        avatar: t.avatar || `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
      }));
    }

    if (enriched.portfolio.items.length === 0 && images.portfolio.length > 0) {
      enriched.portfolio.items = images.portfolio.slice(0, 6).map((src, i) => ({
        title: `Project ${i + 1}`,
        category: industry.replace(/-/g, ' '),
        image: src,
      }));
    }

    return enriched;
  }

  private generateFallback(
    businessName: string,
    industry: string,
    location: string,
    phone: string,
    email: string,
    description?: string,
    theme?: string
  ): AiGeneratedWebsite {
    const images = this.imageService.getImages(industry);
    const fc = FALLBACK_COLORS[industry] || FALLBACK_COLORS['digital-agency'];
    const ff = FALLBACK_FONTS[industry] || FALLBACK_FONTS['digital-agency'];
    const voice = FALLBACK_VOICES[industry] || 'professional and dedicated';
    const mission = FALLBACK_MISSIONS[industry] || '';
    const city = location.split(',')[0].trim();

    const tagline = `Premier ${industry.replace(/-/g, ' ')} in ${city}`;

    return {
      industry,
      theme: theme || 'Modern',
      colors: fc,
      fonts: ff,
      brand: { tagline, mission, logoStyle: 'wordmark', logoPrompt: `Professional ${industry} logo` },
      announcement: { text: '', enabled: false },
      navbar: {
        logo: businessName,
        links: [
          { label: 'Home', href: '#home' }, { label: 'About', href: '#about' },
          { label: 'Services', href: '#services' }, { label: 'Gallery', href: '#gallery' },
          { label: 'Testimonials', href: '#testimonials' }, { label: 'Contact', href: '#contact' },
        ],
        cta: { text: 'Get Started', href: '#contact' },
        sticky: true,
        variant: 'transparent',
      },
      hero: {
        title: `Welcome to ${businessName}`,
        subtitle: `${tagline}. ${mission}`,
        ctaPrimary: 'Get Started', ctaSecondary: 'Learn More',
        badge: '',
        layout: 'centered', backgroundType: 'image',
      },
      about: {
        title: `About ${businessName}`,
        content: `${businessName} is a premier ${industry.replace(/-/g, ' ')} provider in ${city}, dedicated to delivering exceptional service and outstanding results.\n\nOur team brings years of experience and genuine passion to every project. We believe in building lasting relationships through transparent communication and personalized solutions.\n\nDiscover the ${businessName} difference today.`,
        image: images.about[0] || '',
          stats: [
            { value: '500+', label: 'Happy Clients' },
            { value: '10+', label: 'Years Experience' },
            { value: '98%', label: 'Satisfaction Rate' },
          ],
        features: ['Experienced Team', 'Customer-First Approach', 'Quality Guaranteed'],
        layout: 'split-right',
      },
      services: {
        title: 'Our Services',
        description: `Comprehensive ${industry.replace(/-/g, ' ')} solutions designed to exceed your expectations.`,
        items: [
          { title: 'Professional Consultation', description: `Expert ${industry.replace(/-/g, ' ')} consultation tailored to your needs.`, icon: 'star', features: ['Expert Assessment', 'Customized Plan', 'Follow-up Support'] },
          { title: 'Premium Service', description: 'High-quality service delivered with attention to detail.', icon: 'shield', features: ['Quality Assured', 'Timely Delivery', 'Ongoing Support'] },
          { title: 'Custom Solutions', description: 'Tailored solutions designed for your specific requirements.', icon: 'zap', features: ['Custom Approach', 'Flexible Options', 'Results Focused'] },
        ],
        layout: 'grid-3',
      },
      features: {
        title: 'Why Choose Us',
        description: `What sets ${businessName} apart from the competition.`,
        items: [
          { title: 'Expert Team', description: 'Skilled professionals with years of industry experience.', icon: 'users' },
          { title: 'Quality First', description: 'We never compromise on quality and excellence.', icon: 'shield' },
          { title: 'Customer Focus', description: 'Your satisfaction is our top priority.', icon: 'heart' },
        ],
        columns: 3,
      },
      stats: [
        { value: '500+', label: 'Clients Served', icon: 'users' },
        { value: '10+', label: 'Years Experience', icon: 'clock' },
        { value: '98%', label: 'Satisfaction', icon: 'trending-up' },
        { value: '50+', label: 'Experts', icon: 'star' },
      ],
      portfolio: { title: 'Our Work', description: '', items: images.portfolio.slice(0, 6).map((src, i) => ({ title: `Project ${i + 1}`, category: industry.replace(/-/g, ' '), image: src })), layout: 'grid' },
      pricing: { title: 'Pricing', description: '', items: [] },
      gallery: { title: 'Gallery', description: `A glimpse into ${businessName}.`, images: images.gallery.map((src, i) => ({ src, alt: `${industry} image ${i + 1}` })), layout: 'grid' },
      testimonials: {
        title: 'What Our Clients Say',
        description: '',
        items: [
          { name: 'Rajesh Kumar', role: 'Happy Client', company: '', content: `${businessName} provided exceptional service. Professional, reliable, and truly exceeded expectations.`, rating: 5, avatar: 'https://i.pravatar.cc/150?img=1' },
          { name: 'Priya Sharma', role: 'Regular Customer', company: '', content: `Outstanding quality and service. I've been a loyal customer for years and they never disappoint.`, rating: 5, avatar: 'https://i.pravatar.cc/150?img=5' },
          { name: 'Amit Patel', role: 'Business Partner', company: '', content: `Working with ${businessName} has been a pleasure. Their professionalism and dedication are unmatched.`, rating: 5, avatar: 'https://i.pravatar.cc/150?img=8' },
        ],
        layout: 'carousel',
      },
      faq: {
        title: 'Frequently Asked Questions',
        description: '',
        items: [
          { question: 'What services do you offer?', answer: `${businessName} offers comprehensive ${industry.replace(/-/g, ' ')} services. Contact us for a detailed discussion about how we can help you.` },
          { question: 'How can I get started?', answer: `Getting started is easy. Contact us through our website, phone, or email, and we'll guide you through the process.` },
          { question: 'What areas do you serve?', answer: `We proudly serve clients in ${city} and surrounding areas. Contact us to check availability for your location.` },
        ],
        layout: 'accordion',
      },
      process: {
        title: 'How It Works',
        description: 'Our simple process to get you started.',
        steps: [
          { title: 'Contact Us', description: 'Reach out and tell us about your needs.', icon: 'phone' },
          { title: 'Consultation', description: 'We discuss your requirements in detail.', icon: 'message-circle' },
          { title: 'We Deliver', description: 'We provide exceptional service and results.', icon: 'check-circle' },
        ],
      },
      team: {
        title: 'Meet Our Team',
        description: 'The passionate people behind our success.',
        members: [
          { name: 'Rajesh Kumar', role: 'Founder & CEO', bio: 'Visionary leader with 15+ years of industry experience.', avatar: 'https://i.pravatar.cc/300?img=11' },
          { name: 'Priya Singh', role: 'Operations Head', bio: 'Ensuring excellence in every project we deliver.', avatar: 'https://i.pravatar.cc/300?img=12' },
        ],
      },
      cta: {
        title: 'Ready to Get Started?',
        subtitle: `Let ${businessName} help you achieve your goals. Contact us today.`,
        buttonText: 'Contact Us',
        buttonLink: '#contact',
        backgroundType: 'gradient',
      },
      contact: {
        title: 'Get In Touch',
        description: `We'd love to hear from you. Reach out to ${businessName} today.`,
        phone, email, address: `${businessName}, ${location}`,
        mapUrl: `https://www.google.com/maps?q=${encodeURIComponent(businessName + ' ' + location)}`,
        socialLinks: [
          { platform: 'Facebook', url: 'https://facebook.com/', icon: 'facebook' },
          { platform: 'Instagram', url: 'https://instagram.com/', icon: 'instagram' },
        ],
        formFields: [
          { label: 'Name', type: 'text', placeholder: 'Your Name', required: true },
          { label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
          { label: 'Message', type: 'textarea', placeholder: 'Your Message', required: true },
        ],
      },
      newsletter: { title: 'Stay Updated', description: 'Subscribe for updates.', placeholder: 'Enter your email', buttonText: 'Subscribe', enabled: false },
      map: { title: 'Find Us', address: `${businessName}, ${location}`, zoom: 15 },
      footer: {
        description: `${businessName} is dedicated to providing exceptional ${industry.replace(/-/g, ' ')} services in ${city}.`,
        copyright: `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
        columns: [
          { title: 'Quick Links', links: [{ label: 'Home', href: '#home' }, { label: 'About', href: '#about' }, { label: 'Services', href: '#services' }, { label: 'Contact', href: '#contact' }] },
          { title: 'Services', links: [{ label: 'Consultation', href: '#services' }, { label: 'Support', href: '#contact' }, { label: 'FAQ', href: '#faq' }] },
          { title: 'Legal', links: [{ label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms of Service', href: '/terms' }] },
        ],
        socialLinks: [
          { platform: 'Facebook', url: 'https://facebook.com/', icon: 'facebook' },
          { platform: 'Instagram', url: 'https://instagram.com/', icon: 'instagram' },
        ],
        showNewsletter: false,
      },
      seo: {
        metaTitle: `${businessName} | Best ${industry.replace(/-/g, ' ')} in ${city}`,
        metaDescription: `${businessName} offers professional ${industry.replace(/-/g, ' ')} services in ${city}. Contact us today for exceptional service.`,
        keywords: [businessName, industry, city, location, 'premium', 'professional'],
        ogImage: images.hero[0] || '',
        twitterCard: 'summary_large_image',
      },
      layout: [
        { type: 'announcement', variant: 'default' },
        { type: 'navbar', variant: 'transparent' },
        { type: 'hero', variant: 'centered' },
        { type: 'about', variant: 'split-right' },
        { type: 'features', variant: 'grid-3' },
        { type: 'services', variant: 'grid-3' },
        { type: 'stats', variant: 'grid-4' },
        { type: 'portfolio', variant: 'grid' },
        { type: 'gallery', variant: 'grid' },
        { type: 'testimonials', variant: 'carousel' },
        { type: 'process', variant: 'steps' },
        { type: 'team', variant: 'grid' },
        { type: 'faq', variant: 'accordion' },
        { type: 'cta', variant: 'centered' },
        { type: 'contact', variant: 'split' },
        { type: 'newsletter', variant: 'default' },
        { type: 'map', variant: 'full' },
        { type: 'footer', variant: 'columns' },
      ],
    };
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
