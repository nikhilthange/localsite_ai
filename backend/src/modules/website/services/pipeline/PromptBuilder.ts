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
    return 'You are a premium website designer. You will output ONLY valid JSON without markdown formatting. Provide exactly the schema requested for the specific section.';
  }

  buildPrompt(stage: GenerationStage, context: WebsiteGenerationContext): string {
    const baseInfo = `Business: ${context.businessName} | Category: ${context.category} | Location: ${context.location}\n` +
                     `Description: ${context.description}\n` +
                     `Style: ${context.websiteStyle || 'Modern'} | Tone: ${context.tone || 'Professional'}\n` +
                     `Target Audience: ${context.targetAudience || 'General public'}\n`;

    switch (stage) {
      case GenerationStage.BRAND:
        return `${baseInfo}\n` +
               `Generate the brand identity section as a JSON object with a single key "brand" containing:\n` +
               `- "description" (string): A short, punchy 2-sentence brand description.\n` +
               `- "colors" (object): {"primary": "${context.primaryColor || '#000000'}", "secondary": "${context.secondaryColor || '#ffffff'}", "accent": "hex code"}\n` +
               `- "typography" (object): {"headingFont": "string", "bodyFont": "string"}\n` +
               `- "logoText" (string): The text to use for the logo.\n` +
               `- "designStyle" (string): 2-word description of the design aesthetic.`;
      
      case GenerationStage.NAV_HERO:
        return `${baseInfo}\n` +
               `Generate the navigation and hero sections as a JSON object with keys "navigation" and "hero".\n` +
               `"navigation": { "links": [{ "label": "string", "url": "string" }] }\n` +
               `"hero": {\n` +
               `  "headline": "catchy headline",\n` +
               `  "subheadline": "compelling subheadline",\n` +
               `  "primaryButton": { "text": "string", "url": "string" },\n` +
               `  "secondaryButton": { "text": "string", "url": "string" },\n` +
               `  "imageDescription": "description of the hero image"\n` +
               `}`;

      case GenerationStage.SERVICES:
        return `${baseInfo}\n` +
               `Generate the services/products section as a JSON object with a key "services".\n` +
               `"services": {\n` +
               `  "title": "section title",\n` +
               `  "subtitle": "section subtitle",\n` +
               `  "items": [\n` +
               `    { "name": "service name", "description": "short description", "icon": "icon name", "price": "optional string" }\n` +
               `  ] (minimum 3 items)\n` +
               `}`;

      case GenerationStage.ABOUT:
        return `${baseInfo}\n` +
               `Generate the about section as a JSON object with a key "about".\n` +
               `"about": {\n` +
               `  "title": "About Us",\n` +
               `  "content": "A compelling 1-2 paragraph story about the business.",\n` +
               `  "mission": "short mission statement",\n` +
               `  "imageDescription": "description of about section image"\n` +
               `}`;

      case GenerationStage.TESTIMONIALS:
        return `${baseInfo}\n` +
               `Generate the testimonials section as a JSON object with a key "testimonials".\n` +
               `"testimonials": {\n` +
               `  "title": "What Our Clients Say",\n` +
               `  "items": [\n` +
               `    { "quote": "realistic testimonial text", "author": "author name", "role": "author role or location" }\n` +
               `  ] (minimum 3 items)\n` +
               `}`;

      case GenerationStage.FAQ:
        return `${baseInfo}\n` +
               `Generate the FAQ section as a JSON object with a key "faq".\n` +
               `"faq": {\n` +
               `  "title": "Frequently Asked Questions",\n` +
               `  "questions": [\n` +
               `    { "question": "realistic question", "answer": "helpful answer" }\n` +
               `  ] (minimum 4 items)\n` +
               `}`;

      case GenerationStage.CONTACT:
        return `${baseInfo}\n` +
               `Generate the contact section as a JSON object with a key "contact".\n` +
               `"contact": {\n` +
               `  "title": "Contact Us",\n` +
               `  "description": "short text",\n` +
               `  "email": "${context.email || 'hello@example.com'}",\n` +
               `  "phone": "${context.phone || '123-456-7890'}",\n` +
               `  "address": "${context.location || 'City, State'}",\n` +
               `  "socialLinks": { "facebook": "url", "instagram": "url", "twitter": "url" }\n` +
               `}`;

      case GenerationStage.SEO:
        return `${baseInfo}\n` +
               `Generate the SEO metadata as a JSON object with a key "seo".\n` +
               `"seo": {\n` +
               `  "title": "SEO Page Title (under 60 chars)",\n` +
               `  "description": "SEO meta description (under 160 chars)",\n` +
               `  "keywords": ["keyword1", "keyword2", "keyword3"]\n` +
               `}`;

      case GenerationStage.FOOTER:
        return `${baseInfo}\n` +
               `Generate the footer section as a JSON object with a key "footer".\n` +
               `"footer": {\n` +
               `  "copyright": "copyright text",\n` +
               `  "links": [{ "label": "string", "url": "string" }]\n` +
               `}`;

      default:
        throw new Error(`Unknown generation stage: ${stage}`);
    }
  }
}
