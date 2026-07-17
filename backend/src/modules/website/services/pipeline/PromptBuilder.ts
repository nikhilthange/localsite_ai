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
    return 'You are a world-class website copywriter and brand strategist. You output ONLY valid JSON — no markdown, no code fences, no explanation, no extra text. Your content is persuasive, specific, and tailored to the business. Never use placeholder text. Be concise but impactful.';
  }

  buildPrompt(stage: GenerationStage, context: WebsiteGenerationContext): string {
    const audience = context.targetAudience || 'General public';
    const tone = context.tone || 'Professional';
    const style = context.websiteStyle || 'Modern';
    const name = context.businessName;
    const desc = context.description || `${name} provides professional ${context.category} services.`;

    const baseInfo =
      `Business: ${name}\n` +
      `Category: ${context.category}\n` +
      `Location: ${context.location}\n` +
      `Description: ${desc}\n` +
      `Target Audience: ${audience}\n` +
      `Tone: ${tone}\n` +
      `Style: ${style}\n`;

    // Pull data from earlier stages if available
    let brandRef = '';
    if (context.accumulatedData?.brand) {
      const b = context.accumulatedData.brand;
      brandRef = `Brand description: ${b.description || ''}\nBrand design: ${b.designStyle || ''}\n`;
    }

    switch (stage) {
      case GenerationStage.BRAND:
        return baseInfo +
          'Generate the brand identity as JSON with key "brand":\n' +
          '- "tagline" (string): A memorable 5-8 word tagline\n' +
          '- "mission" (string): One sentence mission statement\n' +
          '- "description" (string): Two punchy sentences about what makes this business unique\n' +
          '- "values" (array of strings): 3-4 core values\n' +
          '- "logoStyle" (string): e.g. minimal, elegant, playful, bold\n' +
          '- "logoPrompt" (string): A short DALL-E prompt for generating a logo\n' +
          `- "colors" (object): Use "${context.primaryColor || '#6366F1'}" as primary, "${context.secondaryColor || '#14B8A6'}" as secondary, choose a complementary accent\n` +
          '- "typography" (object): {"headingFont": "Google font name", "bodyFont": "Google font name"}\n' +
          'Make the tagline and mission specific to this business, not generic.';

      case GenerationStage.NAV_HERO:
        return baseInfo + brandRef +
          'Generate nav and hero as JSON with keys "navigation" and "hero":\n' +
          '"navigation": {\n' +
          '  "links": array of 4-5 nav items with "label" and "href" (Home, About, Services, Contact, etc.)\n' +
          '  "cta": { "text": "action text", "href": "#contact" }\n' +
          '}\n' +
          '"hero": {\n' +
          '  "title": A powerful 4-8 word headline that grabs attention\n' +
          '  "subtitle": A compelling 10-15 word supporting line\n' +
          '  "ctaPrimary": "button text like Get Started or Book Now"\n' +
          '  "ctaSecondary": "button text like Learn More"\n' +
          '  "badge": "a trust signal like Trusted by 500+ or 5-Star Rated"\n' +
          '  "layout": "centered"\n' +
          '}\n' +
          'Make the headline specific to this business, not generic.';

      case GenerationStage.SERVICES:
        return baseInfo + brandRef +
          'Generate services as JSON with key "services":\n' +
          '{\n' +
          '  "title": "Our Services" or similar\n' +
          '  "description": A 1-sentence section introduction\n' +
          '  "items": array of 4-6 objects, each with:\n' +
          '    - "title": specific service name (not generic)\n' +
          '    - "description": 1-2 sentence benefit-focused description\n' +
          '    - "icon": one of: star, shield, heart, zap, globe, users, cube, chart-bar, clock, settings\n' +
          '    - "features": array of 3-4 specific feature bullet points\n' +
          '    - "price": optional string like "Starting at $199"\n' +
          '  "layout": "grid-3"\n' +
          '}\n' +
          'Make each service feel real and specific to this business category.';

      case GenerationStage.ABOUT:
        return baseInfo + brandRef +
          'Generate about section as JSON with key "about":\n' +
          '{\n' +
          '  "title": "About Us"\n' +
          '  "content": A 2-3 paragraph story covering: who they are, what drives them, what makes them different. Authentic and human.\n' +
          '  "stats": array of 3 objects with "value" and "label" (e.g. {"value":"12+","label":"Years Experience"})\n' +
          '  "features": array of 4-6 short strings like "Certified Professionals" or "24/7 Support"\n' +
          '  "layout": "split-right"\n' +
          '}\n' +
          'Make the story real, specific, and emotionally engaging.';

      case GenerationStage.TESTIMONIALS:
        return baseInfo + brandRef +
          'Generate testimonials as JSON with key "testimonials":\n' +
          '{\n' +
          '  "title": "What Our Clients Say"\n' +
          '  "description": short section intro\n' +
          '  "items": array of 3 testimonials, each with:\n' +
          '    - "name": full realistic name\n' +
          '    - "role": job title or "Happy Client"\n' +
          '    - "company": company name or empty string\n' +
          '    - "content": a realistic 1-2 sentence quote that sounds like a real person wrote it (not marketing speak)\n' +
          '    - "rating": 4 or 5\n' +
          '  "layout": "carousel"\n' +
          '}\n' +
          'Each testimonial should sound unique and mention something specific about the experience.';

      case GenerationStage.FAQ:
        return baseInfo + brandRef +
          'Generate FAQ as JSON with key "faq":\n' +
          '{\n' +
          '  "title": "Frequently Asked Questions"\n' +
          '  "description": short section intro\n' +
          '  "items": array of 5-6 realistic questions and answers, each with:\n' +
          '    - "question": a real question customers would ask\n' +
          '    - "answer": a helpful, specific 1-3 sentence answer\n' +
          '  "layout": "accordion"\n' +
          '}\n' +
          'Questions should be specific to this industry (e.g. for restaurant: "Do you accommodate dietary restrictions?")';

      case GenerationStage.CONTACT:
        return baseInfo +
          'Generate contact section as JSON with key "contact":\n' +
          '{\n' +
          '  "title": "Get In Touch"\n' +
          '  "description": "A warm invitation to reach out, 1 sentence."\n' +
          `  "email": "${context.email || 'hello@example.com'}"\n` +
          `  "phone": "${context.phone || '555-0100'}"\n` +
          `  "address": "${context.location || 'City, State'}"\n` +
          '  "socialLinks": array of {"platform": "facebook", "url": "#", "icon": "facebook"}\n' +
          '  "formFields": array of 3-4 objects with "label", "type" ("text"/"email"/"textarea"), "placeholder", "required" (bool)\n' +
          '}\n' +
          'Use the provided email, phone, and address if given.';

      case GenerationStage.SEO:
        return baseInfo + brandRef +
          'Generate SEO metadata as JSON with key "seo":\n' +
          '{\n' +
          '  "metaTitle": SEO title under 60 chars, includes business name + primary keyword\n' +
          '  "metaDescription": compelling description under 160 chars that includes location and key service\n' +
          '  "keywords": array of 5-8 relevant keywords for this business\n' +
          '  "ogImage": ""\n' +
          '  "twitterCard": "summary_large_image"\n' +
          '}\n' +
          'Make these specific to this business, not template text.';

      case GenerationStage.FOOTER:
        return baseInfo + brandRef +
          'Generate footer as JSON with key "footer":\n' +
          '{\n' +
          '  "description": A 1-sentence brand description\n' +
          '  "copyright": "© 2026 Business Name. All rights reserved."\n' +
          '  "columns": array of 2-3 objects with "title" and "links" (array of {"label","href"})\n' +
          '  "socialLinks": array of {"platform": "facebook", "url": "#", "icon": "facebook"}\n' +
          '  "showNewsletter": false\n' +
          '}\n' +
          'Include useful footer links like Privacy Policy, Terms of Service, About, Contact.';

      default:
        throw new Error(`Unknown generation stage: ${stage}`);
    }
  }
}
