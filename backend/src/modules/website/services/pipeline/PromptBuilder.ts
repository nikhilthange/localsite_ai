export enum GenerationStage {
  BRAND = 'brand',
  NAV_HERO = 'nav_hero',
  SERVICES = 'services',
  ABOUT = 'about',
  TESTIMONIALS = 'testimonials',
  FAQ = 'faq',
  CONTACT = 'contact',
  SEO = 'seo',
  FOOTER = 'footer'
}

export interface WebsiteGenerationContext {
  businessName: string;
  category: string;
  location: string;
  phone: string;
  email: string;
  description: string;
  theme: string;
  primaryColor?: string;
  secondaryColor?: string;
  targetAudience?: string;
  tone?: string;
  websiteStyle?: string;
  // Accumulated data from previous stages to provide context to later stages
  accumulatedData: Record<string, any>;
}

export class PromptBuilder {
  buildSystemPrompt(): string {
    return 'You are an elite, world-class website copywriter, brand strategist, and JSON architect. You output ONLY valid JSON — no markdown formatting, no code fences (like ```json), no explanations, no extra text. Your content is persuasive, specific, highly tailored to the exact industry of the business, and emotionally resonant. Never use generic placeholder text like "Lorem Ipsum". Be concise but incredibly impactful.';
  }

  private getIndustrySpecificGuidelines(category: string): string {
    const guidelines: Record<string, string> = {
      'Restaurant': 'Focus heavily on menu highlights, ambiance, dining experience, reservations, dietary options, and local ingredients.',
      'Gym/Fitness': 'Focus on transformation, energy, class schedules, personal training, membership benefits, and state-of-the-art equipment.',
      'Law Firm': 'Maintain a highly professional, authoritative, and trustworthy tone. Emphasize practice areas, case results, free consultations, and attorney expertise.',
      'Real Estate': 'Focus on property listings, market expertise, neighborhood guides, buying/selling processes, and finding dream homes.',
      'E-Commerce': 'Focus on featured products, collections, free shipping, return policies, secure checkout, and customer reviews.',
      'SaaS/Tech': 'Focus on features, integrations, scalable solutions, data security, ROI, pricing tiers, and modern technology.',
      'Plumber/HVAC': 'Emphasize 24/7 emergency service, reliability, licensed/insured professionals, transparent pricing, and fast response times.',
      'Medical/Dental': 'Maintain a compassionate, sterile, and professional tone. Highlight patient care, advanced technology, booking appointments, and insurance accepted.',
      'Salon/Spa': 'Focus on relaxation, beauty treatments, booking online, luxurious atmosphere, expert stylists, and self-care.',
      'Photography': 'Focus on capturing moments, portfolio showcases, booking sessions, artistic style, and emotional storytelling.',
      'Consulting': 'Focus on business growth, strategic insights, case studies, proven methodologies, and professional expertise.',
      'Construction': 'Emphasize safety, project timelines, quality materials, past projects portfolio, commercial/residential, and free estimates.',
      'Auto Repair': 'Focus on trust, ASE certified mechanics, honest pricing, warranties, diagnostics, and quick turnaround.',
      'Cleaning Service': 'Emphasize eco-friendly products, trusted/vetted staff, sparkling results, recurring schedules, and satisfaction guarantees.',
      'Education/Tutor': 'Focus on student success, personalized learning, expert instructors, curriculum, and academic excellence.',
      'Event Planning': 'Focus on memorable experiences, stress-free execution, vendor relationships, custom themes, and attention to detail.',
      'Marketing Agency': 'Focus on ROI, data-driven strategies, creative campaigns, client growth, SEO/PPC, and brand building.',
      'Non-Profit': 'Focus on the mission, community impact, donation transparency, volunteer opportunities, and emotional storytelling.',
      'Financial/Accounting': 'Focus on wealth management, tax compliance, secure data, fiduciary duty, and long-term financial planning.'
    };

    return guidelines[category] || 'Focus on delivering high-quality products/services, exceptional customer support, and solving the target audience\'s core problems.';
  }

  buildPrompt(stage: GenerationStage, context: WebsiteGenerationContext): string {
    const audience = context.targetAudience || 'General public';
    const tone = context.tone || 'Professional';
    const style = context.websiteStyle || 'Modern';
    const name = context.businessName;
    const category = context.category;
    const desc = context.description || `${name} provides professional ${category} services.`;
    const industryGuidelines = this.getIndustrySpecificGuidelines(category);

    const baseInfo =
      `Business: ${name}\n` +
      `Industry/Category: ${category}\n` +
      `Location: ${context.location}\n` +
      `Description: ${desc}\n` +
      `Target Audience: ${audience}\n` +
      `Tone: ${tone}\n` +
      `Style: ${style}\n\n` +
      `CRITICAL INDUSTRY GUIDELINES:\n${industryGuidelines}\n\n`;

    // Pull data from earlier stages if available
    let brandRef = '';
    if (context.accumulatedData?.brand) {
      const b = context.accumulatedData.brand;
      brandRef = `Brand Reference Data:\nTagline: ${b.tagline || ''}\nMission: ${b.mission || ''}\n`;
    }

    switch (stage) {
      case GenerationStage.BRAND:
        return baseInfo +
          'Generate the brand identity as JSON with key "brand". Make it highly specific to the industry.\n' +
          '{\n' +
          '  "brand": {\n' +
          '    "tagline": "A memorable 5-8 word tagline",\n' +
          '    "mission": "One sentence mission statement",\n' +
          '    "description": "Two punchy sentences about what makes this business unique in their industry",\n' +
          '    "values": ["3-4 core values"],\n' +
          '    "logoStyle": "e.g. minimal, elegant, playful, bold",\n' +
          '    "logoPrompt": "A short DALL-E prompt for generating a logo",\n' +
          `    "colors": {"primary": "${context.primaryColor || '#6366F1'}", "secondary": "${context.secondaryColor || '#14B8A6'}", "accent": "hex code"},\n` +
          '    "typography": {"headingFont": "Google font name", "bodyFont": "Google font name"}\n' +
          '  }\n' +
          '}';

      case GenerationStage.NAV_HERO:
        return baseInfo + brandRef +
          'Generate nav and hero as JSON with keys "navigation" and "hero". Adjust the nav links based on what makes sense for the industry (e.g. "Menu" for restaurants, "Practice Areas" for Law Firms).\n' +
          '{\n' +
          '  "navigation": {\n' +
          '    "links": [{"label": "string", "href": "string"}], // 4-5 items\n' +
          '    "cta": { "text": "action text", "href": "#contact" }\n' +
          '  },\n' +
          '  "hero": {\n' +
          '    "title": "A powerful 4-8 word headline that grabs attention",\n' +
          '    "subtitle": "A compelling 10-15 word supporting line",\n' +
          '    "ctaPrimary": "button text like Get Started or Book Now",\n' +
          '    "ctaSecondary": "button text like Learn More",\n' +
          '    "badge": "a trust signal like Trusted by 500+ or 5-Star Rated",\n' +
          '    "layout": "centered"\n' +
          '  }\n' +
          '}';

      case GenerationStage.SERVICES:
        return baseInfo + brandRef +
          'Generate services/offerings as JSON with key "services". Adapt the title to the industry (e.g. "Our Menu", "Practice Areas", "Our Fleet").\n' +
          '{\n' +
          '  "services": {\n' +
          '    "title": "Section Title",\n' +
          '    "description": "A 1-sentence section introduction",\n' +
          '    "items": [\n' +
          '      {\n' +
          '        "title": "specific service/product name",\n' +
          '        "description": "1-2 sentence benefit-focused description",\n' +
          '        "icon": "one of: star, shield, heart, zap, globe, users, cube, chart-bar, clock, settings",\n' +
          '        "features": ["3-4 specific bullet points"],\n' +
          '        "price": "optional string like Starting at $199"\n' +
          '      }\n' +
          '    ], // 4-6 items\n' +
          '    "layout": "grid-3"\n' +
          '  }\n' +
          '}';

      case GenerationStage.ABOUT:
        return baseInfo + brandRef +
          'Generate about section as JSON with key "about". Adapt to industry (e.g. "Meet the Chef", "Our Attorneys").\n' +
          '{\n' +
          '  "about": {\n' +
          '    "title": "About Us",\n' +
          '    "content": "A 2-3 paragraph story covering: who they are, what drives them, what makes them different. Authentic and human.",\n' +
          '    "stats": [{"value": "12+", "label": "Years Experience"}], // 3 stats\n' +
          '    "features": ["4-6 short strings like Certified Professionals"],\n' +
          '    "layout": "split-right"\n' +
          '  }\n' +
          '}';

      case GenerationStage.TESTIMONIALS:
        return baseInfo + brandRef +
          'Generate testimonials as JSON with key "testimonials". Make the reviews highly specific to the industry and service provided.\n' +
          '{\n' +
          '  "testimonials": {\n' +
          '    "title": "What Our Clients Say",\n' +
          '    "description": "short section intro",\n' +
          '    "items": [\n' +
          '      {\n' +
          '        "name": "full realistic name",\n' +
          '        "role": "job title or Happy Client",\n' +
          '        "company": "company name or empty string",\n' +
          '        "content": "a realistic 1-2 sentence quote that sounds like a real person wrote it mentioning specific industry details",\n' +
          '        "rating": 5\n' +
          '      }\n' +
          '    ], // 3 items\n' +
          '    "layout": "carousel"\n' +
          '  }\n' +
          '}';

      case GenerationStage.FAQ:
        return baseInfo + brandRef +
          'Generate FAQ as JSON with key "faq". Questions MUST be highly specific to the industry (e.g. dietary restrictions for food, insurance for medical, guarantees for trades).\n' +
          '{\n' +
          '  "faq": {\n' +
          '    "title": "Frequently Asked Questions",\n' +
          '    "description": "short section intro",\n' +
          '    "items": [\n' +
          '      {\n' +
          '        "question": "a real question customers would ask in this industry",\n' +
          '        "answer": "a helpful, specific 1-3 sentence answer"\n' +
          '      }\n' +
          '    ], // 5-6 items\n' +
          '    "layout": "accordion"\n' +
          '  }\n' +
          '}';

      case GenerationStage.CONTACT:
        return baseInfo +
          'Generate contact section as JSON with key "contact". Include fields appropriate for the industry (e.g. "Date of Event" for event planners).\n' +
          '{\n' +
          '  "contact": {\n' +
          '    "title": "Get In Touch",\n' +
          '    "description": "A warm invitation to reach out, 1 sentence.",\n' +
          `    "email": "${context.email || 'hello@example.com'}",\n` +
          `    "phone": "${context.phone || '555-0100'}",\n` +
          `    "address": "${context.location || 'City, State'}",\n` +
          '    "socialLinks": [{"platform": "facebook", "url": "#", "icon": "facebook"}],\n' +
          '    "formFields": [{"label": "string", "type": "text|email|textarea|date", "placeholder": "string", "required": true}] // 4-5 fields\n' +
          '  }\n' +
          '}';

      case GenerationStage.SEO:
        return baseInfo + brandRef +
          'Generate SEO metadata as JSON with key "seo". Must be highly optimized for the specific industry and location.\n' +
          '{\n' +
          '  "seo": {\n' +
          '    "metaTitle": "SEO title under 60 chars, includes business name + primary keyword",\n' +
          '    "metaDescription": "compelling description under 160 chars that includes location and key service",\n' +
          '    "keywords": ["5-8 relevant keywords for this business"],\n' +
          '    "ogImage": "",\n' +
          '    "twitterCard": "summary_large_image"\n' +
          '  }\n' +
          '}';

      case GenerationStage.FOOTER:
        return baseInfo + brandRef +
          'Generate footer as JSON with key "footer".\n' +
          '{\n' +
          '  "footer": {\n' +
          '    "description": "A 1-sentence brand description",\n' +
          '    "copyright": "© 2026 Business Name. All rights reserved.",\n' +
          '    "columns": [{"title": "string", "links": [{"label": "string", "href": "string"}]}], // 2-3 columns\n' +
          '    "socialLinks": [{"platform": "facebook", "url": "#", "icon": "facebook"}],\n' +
          '    "showNewsletter": false\n' +
          '  }\n' +
          '}';

      default:
        throw new Error(`Unknown generation stage: ${stage}`);
    }
  }
}
