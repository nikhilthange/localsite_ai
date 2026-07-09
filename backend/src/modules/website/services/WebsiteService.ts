import { Types } from 'mongoose';
import { WebsiteRepository } from '../repositories/WebsiteRepository';
import { IWebsite, WebsiteStatus, AiGeneratedWebsite, SectionType } from '../../../types/website';
import { EventBus } from '../../../core/events/EventBus';
import { SystemEvents } from '../../../types/events';
import { QueueService, QueueNames } from '../../../core/queue/QueueService';
import { NotFoundError, ForbiddenError } from '../../../utils/AppError';
import { generateSubdomain } from '../../../utils/helpers';
import { PaginationParams, PaginatedResult } from '../../../types/services';
import { TemplateEngine } from './TemplateEngine';
import { AIEngineService } from '../../ai/services/AIEngineService';
import { Logger } from '../../../core/logging/Logger';
import { LogoService } from './LogoService';
import { ImageService } from './ImageService';

export class WebsiteService {
  private repository: WebsiteRepository;
  private templateEngine: TemplateEngine;
  private logoService: LogoService;
  private imageService: ImageService;

  constructor() {
    this.repository = new WebsiteRepository();
    this.templateEngine = new TemplateEngine(new AIEngineService());
    this.logoService = new LogoService();
    this.imageService = new ImageService();
  }

  async createWebsite(userId: string, data: {
    businessName: string;
    category: string;
    location: string;
    description?: string;
    phone?: string;
    email?: string;
    template?: string;
  }): Promise<IWebsite> {
    const subdomain = generateSubdomain(data.businessName);
    const template = data.template || 'default';

    const website = await this.repository.create({
      userId: new Types.ObjectId(userId),
      businessName: data.businessName,
      category: data.category,
      location: data.location,
      description: data.description || '',
      phone: data.phone || '',
      email: data.email || '',
      subdomain,
      template,
      status: 'draft',
    } as any);

    EventBus.emit(SystemEvents.WEBSITE_CREATED, {
      websiteId: website._id.toString(),
      userId,
      businessName: data.businessName,
      timestamp: new Date(),
    });

    return website;
  }

  async getWebsites(
    userId: string,
    params: PaginationParams & { status?: string; search?: string }
  ): Promise<PaginatedResult<IWebsite>> {
    return this.repository.getWebsitesByUserPaginated(userId, params);
  }

  async getWebsiteById(websiteId: string, userId: string): Promise<IWebsite> {
    const website = await this.repository.getWebsiteWithDetails(websiteId);
    if (!website) {
      throw new NotFoundError('Website');
    }
    if (website.userId.toString() !== userId) {
      throw new ForbiddenError('You do not own this website');
    }
    return website;
  }

  async updateWebsite(websiteId: string, userId: string, data: Partial<IWebsite>): Promise<IWebsite> {
    const website = await this.repository.findById(websiteId);
    if (!website) {
      throw new NotFoundError('Website');
    }
    if (website.userId.toString() !== userId) {
      throw new ForbiddenError('You do not own this website');
    }
    const updated = await this.repository.update(websiteId, data as any);
    if (!updated) {
      throw new NotFoundError('Website');
    }
    return updated;
  }

  async deleteWebsite(websiteId: string, userId: string): Promise<void> {
    const website = await this.repository.findById(websiteId);
    if (!website) {
      throw new NotFoundError('Website');
    }
    if (website.userId.toString() !== userId) {
      throw new ForbiddenError('You do not own this website');
    }
    await this.repository.update(websiteId, { status: 'archived' } as any);

    EventBus.emit(SystemEvents.WEBSITE_DELETED, {
      websiteId,
      userId,
      timestamp: new Date(),
    });
  }

  async generateComplete(userId: string, data: {
    businessName: string;
    category: string;
    location: string;
    description?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    socialLinks?: Array<{ platform: string; url: string }>;
    theme?: string;
  }): Promise<IWebsite> {
    const t0 = Date.now();
    const industryKey = this.templateEngine.resolveIndustry(data.category);

    const existingWebsite = await this.repository.findOne({
      userId: new Types.ObjectId(userId),
      businessName: data.businessName,
      status: { $ne: 'archived' },
    } as any);

    if (existingWebsite) {
      Logger.info('Regenerating existing website', { businessName: data.businessName, id: existingWebsite._id });

      Logger.info('Sending AI request', { businessName: data.businessName, elapsedMs: Date.now() - t0 });
      const tAiStart = Date.now();
      const plan = await this.templateEngine.generatePlan(
        data.businessName,
        data.category,
        data.location,
        data.phone || '',
        data.email || '',
        data.description,
        data.theme,
        userId,
        existingWebsite._id.toString()
      );
      Logger.info('AI response received', { businessName: data.businessName, aiElapsedMs: Date.now() - tAiStart, totalElapsedMs: Date.now() - t0 });

      Logger.info('Saving website', { businessName: data.businessName, elapsedMs: Date.now() - t0 });
      const updateData = this.planToWebsiteUpdate(plan, data);
      await this.repository.update(existingWebsite._id.toString(), {
        ...updateData,
        lastGeneratedAt: new Date(),
        version: (existingWebsite.version || 0) + 1,
      } as any);
      Logger.info('Website saved', { websiteId: existingWebsite._id.toString(), totalElapsedMs: Date.now() - t0 });

      return this.repository.findById(existingWebsite._id.toString()) as Promise<IWebsite>;
    }

    Logger.info('Creating website record', { businessName: data.businessName, category: data.category, elapsedMs: Date.now() - t0 });
    const website = await this.createWebsite(userId, data);

    Logger.info('Sending AI request', { businessName: data.businessName, industry: data.category, websiteId: website._id.toString(), elapsedMs: Date.now() - t0 });
    const tAiStart = Date.now();
    const plan = await this.templateEngine.generatePlan(
      data.businessName,
      data.category,
      data.location,
      data.phone || '',
      data.email || '',
      data.description,
      data.theme,
      userId,
      website._id.toString()
    );
    Logger.info('AI response received', { businessName: data.businessName, aiElapsedMs: Date.now() - tAiStart, totalElapsedMs: Date.now() - t0 });

    Logger.info('Saving website', { businessName: data.businessName, elapsedMs: Date.now() - t0 });
    const updateData = this.planToWebsiteUpdate(plan, data);
    await this.repository.update(website._id.toString(), {
      ...updateData,
      lastGeneratedAt: new Date(),
      version: 1,
    } as any);
    Logger.info('Website saved', { websiteId: website._id.toString(), totalElapsedMs: Date.now() - t0 });

    return this.repository.findById(website._id.toString()) as Promise<IWebsite>;
  }

  private planToWebsiteUpdate(plan: AiGeneratedWebsite, data: {
    businessName: string;
    category: string;
    location: string;
    description?: string;
    phone?: string;
    email?: string;
  }): Partial<IWebsite> {
    const sections = this.buildSections(plan);
    const imageService = this.imageService;
    const industryKey = this.templateEngine.resolveIndustry(data.category);

    return {
      description: data.description || '',
      template: plan.industry || industryKey,
      sections,
      branding: {
        logo: '',
        logoPrompt: plan.brand.logoPrompt,
        favicon: '',
        colors: {
          primary: plan.colors.primary,
          primaryLight: this.lighten(plan.colors.primary, 0.2),
          primaryDark: this.darken(plan.colors.primary, 0.15),
          secondary: plan.colors.secondary,
          secondaryLight: this.lighten(plan.colors.secondary, 0.2),
          accent: plan.colors.accent,
          accentLight: this.lighten(plan.colors.accent, 0.2),
          background: plan.colors.background,
          surface: plan.colors.surface || '#FFFFFF',
          surfaceAlt: this.darken(plan.colors.background, 0.03),
          text: plan.colors.text,
          textSecondary: this.darken(plan.colors.text, 0.4),
          textInverse: '#FFFFFF',
          border: this.lighten(plan.colors.text, 0.8),
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          darkMode: {
            background: '#09090B',
            surface: '#18181B',
            surfaceAlt: '#27272A',
            text: '#FAFAFA',
            textSecondary: '#A1A1AA',
            border: '#27272A',
          },
          gradients: {
            primary: `linear-gradient(135deg, ${plan.colors.primary}, ${plan.colors.secondary})`,
            secondary: `linear-gradient(135deg, ${plan.colors.secondary}, ${plan.colors.accent})`,
            accent: `linear-gradient(135deg, ${plan.colors.accent}, ${this.lighten(plan.colors.accent, 0.2)})`,
          },
        },
        fonts: {
          heading: plan.fonts.heading,
          body: plan.fonts.body,
          headingWeight: 700,
          bodyWeight: 400,
        },
        spacing: {
          sectionPadding: 'py-16 md:py-24',
          sectionMargin: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
          elementGap: 'gap-6 md:gap-8',
          containerWidth: 'max-w-7xl',
        },
        shadows: {
          small: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          medium: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          large: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          focus: `0 0 0 2px ${plan.colors.primary}`,
        },
        animations: {
          section: 'fade-up',
          card: 'stagger',
          hover: 'lift',
          hero: 'parallax',
          duration: 0.6,
        },
        logoStyle: plan.brand.logoStyle,
        brandVoice: '',
        tagline: plan.brand.tagline,
        mission: plan.brand.mission,
      },
      seo: {
        metaTitle: plan.seo.metaTitle.slice(0, 70),
        metaDescription: plan.seo.metaDescription.slice(0, 160),
        keywords: plan.seo.keywords,
        ogImage: plan.seo.ogImage || imageService.getHeroImage(industryKey),
        ogTitle: plan.seo.metaTitle.slice(0, 70),
        ogDescription: plan.seo.metaDescription.slice(0, 160),
        structuredData: this.buildStructuredData(plan, data),
        sitemapIncluded: true,
        twitterCard: plan.seo.twitterCard || 'summary_large_image',
      },
      lastGeneratedAt: new Date(),
    } as any;
  }

  private buildSections(plan: AiGeneratedWebsite): Array<{
    id: string; type: SectionType; variant: string; visible: boolean;
    order: number; data: Record<string, any>; background?: any;
  }> {
    const sections: any[] = [];
    let order = 0;

    if (plan.announcement?.enabled) {
      sections.push({
        id: 'announcement', type: 'announcement' as SectionType,
        variant: 'default', visible: true, order: order++,
        data: { text: plan.announcement.text },
        background: { type: 'color', value: plan.colors.primary },
      });
    }

    sections.push({
      id: 'navbar', type: 'navbar' as SectionType,
      variant: plan.navbar.variant || 'transparent', visible: true, order: order++,
      data: {
        logo: plan.navbar.logo || '',
        links: plan.navbar.links,
        cta: plan.navbar.cta,
        sticky: plan.navbar.sticky ?? true,
      },
    });

    sections.push({
      id: 'hero', type: 'hero' as SectionType,
      variant: plan.hero.layout || 'centered', visible: true, order: order++,
      data: {
        title: plan.hero.title,
        subtitle: plan.hero.subtitle,
        ctaPrimary: plan.hero.ctaPrimary,
        ctaSecondary: plan.hero.ctaSecondary,
        badge: plan.hero.badge,
        backgroundType: plan.hero.backgroundType,
      },
      background: {
        type: 'image',
        overlay: `linear-gradient(135deg, ${plan.colors.primary}CC, ${plan.colors.secondary}88)`,
        parallax: true,
      },
    });

    sections.push({
      id: 'about', type: 'about' as SectionType,
      variant: plan.about.layout || 'split-right', visible: true, order: order++,
      data: {
        title: plan.about.title,
        content: plan.about.content,
        image: plan.about.image,
        stats: plan.about.stats,
        features: plan.about.features,
      },
    });

    if (plan.features?.items?.length > 0) {
      sections.push({
        id: 'features', type: 'features' as SectionType,
        variant: `grid-${plan.features.columns || 3}`, visible: true, order: order++,
        data: {
          title: plan.features.title,
          description: plan.features.description,
          items: plan.features.items,
          columns: plan.features.columns || 3,
        },
      });
    }

    if (plan.services?.items?.length > 0) {
      sections.push({
        id: 'services', type: 'services' as SectionType,
        variant: plan.services.layout || 'grid-3', visible: true, order: order++,
        data: {
          title: plan.services.title,
          description: plan.services.description,
          items: plan.services.items,
        },
      });
    }

    if (plan.stats?.length > 0) {
      sections.push({
        id: 'stats', type: 'stats' as SectionType,
        variant: 'grid-4', visible: true, order: order++,
        data: { items: plan.stats },
        background: { type: 'gradient', value: `linear-gradient(135deg, ${plan.colors.primary}, ${plan.colors.secondary})` },
      });
    }

    if (plan.portfolio?.items?.length > 0) {
      sections.push({
        id: 'portfolio', type: 'portfolio' as SectionType,
        variant: plan.portfolio.layout || 'grid', visible: true, order: order++,
        data: {
          title: plan.portfolio.title,
          description: plan.portfolio.description,
          items: plan.portfolio.items,
        },
      });
    }

    if (plan.gallery?.images?.length > 0) {
      sections.push({
        id: 'gallery', type: 'gallery' as SectionType,
        variant: plan.gallery.layout || 'grid', visible: true, order: order++,
        data: {
          title: plan.gallery.title,
          description: plan.gallery.description,
          images: plan.gallery.images,
        },
      });
    }

    if (plan.testimonials?.items?.length > 0) {
      sections.push({
        id: 'testimonials', type: 'testimonials' as SectionType,
        variant: plan.testimonials.layout || 'carousel', visible: true, order: order++,
        data: {
          title: plan.testimonials.title,
          description: plan.testimonials.description,
          items: plan.testimonials.items,
        },
      });
    }

    if (plan.process?.steps?.length > 0) {
      sections.push({
        id: 'process', type: 'process' as SectionType,
        variant: 'steps', visible: true, order: order++,
        data: {
          title: plan.process.title,
          description: plan.process.description,
          steps: plan.process.steps,
        },
      });
    }

    if (plan.pricing?.items?.length > 0) {
      sections.push({
        id: 'pricing', type: 'pricing' as SectionType,
        variant: 'cards', visible: true, order: order++,
        data: {
          title: plan.pricing.title,
          description: plan.pricing.description,
          items: plan.pricing.items,
        },
      });
    }

    if (plan.team?.members?.length > 0) {
      sections.push({
        id: 'team', type: 'team' as SectionType,
        variant: 'grid', visible: true, order: order++,
        data: {
          title: plan.team.title,
          description: plan.team.description,
          members: plan.team.members,
        },
      });
    }

    if (plan.faq?.items?.length > 0) {
      sections.push({
        id: 'faq', type: 'faq' as SectionType,
        variant: plan.faq.layout || 'accordion', visible: true, order: order++,
        data: {
          title: plan.faq.title,
          description: plan.faq.description,
          items: plan.faq.items,
        },
      });
    }

    sections.push({
      id: 'cta', type: 'cta' as SectionType,
      variant: 'centered', visible: true, order: order++,
      data: {
        title: plan.cta.title,
        subtitle: plan.cta.subtitle,
        buttonText: plan.cta.buttonText,
        buttonLink: plan.cta.buttonLink,
        backgroundType: plan.cta.backgroundType,
      },
      background: {
        type: plan.cta.backgroundType || 'gradient',
        value: `linear-gradient(135deg, ${plan.colors.primary}, ${plan.colors.secondary})`,
      },
    });

    sections.push({
      id: 'contact', type: 'contact' as SectionType,
      variant: 'split', visible: true, order: order++,
      data: {
        title: plan.contact.title,
        description: plan.contact.description,
        phone: plan.contact.phone,
        email: plan.contact.email,
        address: plan.contact.address,
        mapUrl: plan.contact.mapUrl,
        socialLinks: plan.contact.socialLinks,
        formFields: plan.contact.formFields,
      },
    });

    if (plan.newsletter?.enabled) {
      sections.push({
        id: 'newsletter', type: 'newsletter' as SectionType,
        variant: 'default', visible: true, order: order++,
        data: {
          title: plan.newsletter.title,
          description: plan.newsletter.description,
          placeholder: plan.newsletter.placeholder,
          buttonText: plan.newsletter.buttonText,
        },
        background: { type: 'color', value: plan.colors.surfaceAlt },
      });
    }

    if (plan.map?.address) {
      sections.push({
        id: 'map', type: 'map' as SectionType,
        variant: 'full', visible: true, order: order++,
        data: {
          title: plan.map.title,
          address: plan.map.address,
          lat: plan.map.lat,
          lng: plan.map.lng,
          zoom: plan.map.zoom,
        },
      });
    }

    sections.push({
      id: 'footer', type: 'footer' as SectionType,
      variant: 'columns', visible: true, order: order++,
      data: {
        description: plan.footer.description,
        copyright: plan.footer.copyright,
        columns: plan.footer.columns,
        socialLinks: plan.footer.socialLinks,
        showNewsletter: plan.footer.showNewsletter,
      },
      background: { type: 'color', value: plan.colors.text },
    });

    return sections;
  }

  private buildStructuredData(plan: AiGeneratedWebsite, data: { businessName: string; category: string; location: string; phone?: string; email?: string }): Record<string, any> {
    const typeMap: Record<string, string> = {
      cafe: 'CafeOrCoffeeShop', restaurant: 'Restaurant', hotel: 'Hotel', gym: 'HealthClub',
      salon: 'BeautySalon', hospital: 'Hospital', clinic: 'MedicalClinic', 'law-firm': 'LegalService',
      construction: 'HomeAndConstructionBusiness', 'real-estate': 'RealEstateAgent',
      photographer: 'Photography', 'travel-agency': 'TravelAgency', school: 'School',
      'coaching-institute': 'EducationalOrganization', 'digital-agency': 'ProfessionalService',
    };

    const industryKey = this.templateEngine.resolveIndustry(data.category);

    return {
      '@context': 'https://schema.org',
      '@type': typeMap[industryKey] || 'LocalBusiness',
      name: data.businessName,
      description: plan.brand.mission,
      image: plan.seo.ogImage,
      telephone: data.phone,
      email: data.email,
      address: { '@type': 'PostalAddress', streetAddress: plan.contact.address || `${data.businessName}, ${data.location}` },
      sameAs: plan.contact.socialLinks.map(l => l.url),
    };
  }

  private lighten(hex: string, amount: number): string {
    const { r, g, b } = this.hexToRgb(hex);
    const l = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount));
    return `#${l(r).toString(16).padStart(2, '0')}${l(g).toString(16).padStart(2, '0')}${l(b).toString(16).padStart(2, '0')}`;
  }

  private darken(hex: string, amount: number): string {
    const { r, g, b } = this.hexToRgb(hex);
    const d = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
    return `#${d(r).toString(16).padStart(2, '0')}${d(g).toString(16).padStart(2, '0')}${d(b).toString(16).padStart(2, '0')}`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 99, g: 102, b: 241 };
  }

  async generateWebsiteContent(websiteId: string, userId: string): Promise<void> {
    const website = await this.getWebsiteById(websiteId, userId);

    await QueueService.addJob(
      QueueNames.AI_GENERATION,
      'website-content-generation',
      {
        websiteId: website._id.toString(),
        userId,
        businessName: website.businessName,
        category: website.category,
        location: website.location,
        template: website.template,
      }
    );
  }

  async publishWebsite(websiteId: string, userId: string): Promise<IWebsite> {
    const website = await this.getWebsiteById(websiteId, userId);

    if (website.status === 'published') {
      return website;
    }

    const updated = await this.repository.update(websiteId, {
      status: 'published',
      publishedAt: new Date(),
    } as any);

    if (!updated) {
      throw new NotFoundError('Website');
    }

    EventBus.emit(SystemEvents.WEBSITE_DEPLOYED, {
      websiteId,
      userId,
      status: 'started',
      timestamp: new Date(),
    });

    return updated;
  }

  async searchWebsites(query: string): Promise<IWebsite[]> {
    return this.repository.searchByName(query);
  }

  async updateSection(websiteId: string, userId: string, sectionId: string, data: Record<string, any>): Promise<IWebsite> {
    const website = await this.getWebsiteById(websiteId, userId);
    const sections = (website.sections || []).map(s =>
      s.id === sectionId ? { ...s, data: { ...s.data, ...data } } : s
    );
    return this.updateWebsite(websiteId, userId, { sections } as any);
  }

  async reorderSections(websiteId: string, userId: string, sectionIds: string[]): Promise<IWebsite> {
    const website = await this.getWebsiteById(websiteId, userId);
    const sections = (website.sections || []).map(s => ({
      ...s,
      order: sectionIds.indexOf(s.id) >= 0 ? sectionIds.indexOf(s.id) : s.order,
    }));
    return this.updateWebsite(websiteId, userId, { sections } as any);
  }
}
