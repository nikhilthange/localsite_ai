import { WebsiteRepository } from '../repositories/WebsiteRepository';
import { Logger } from '../../../core/logging/Logger';

const repository = new WebsiteRepository();

export class LogoService {
  static async generateLogo(websiteId: string, businessName: string): Promise<void> {
    const website = await repository.findById(websiteId);
    if (!website) throw new Error('Website not found');

    await repository.updateBranding(websiteId, {
      logo: '',
      logoVariations: [],
      primaryColor: website.branding?.primaryColor || '#3B82F6',
      secondaryColor: website.branding?.secondaryColor || '#1E40AF',
      accentColor: website.branding?.accentColor || '#F59E0B',
      font: website.branding?.font || 'Inter',
      borderRadius: website.branding?.borderRadius || '0.5rem',
    });

    Logger.info('Logo placeholder set', { websiteId, businessName });
  }
}
