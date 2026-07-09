import { Job } from 'bullmq';
import { QueueService, QueueNames } from '../core/queue/QueueService';
import { Logger } from '../core/logging/Logger';
import { emitToUser } from '../core/socket/SocketSetup';
import { AIEngineService } from '../modules/ai/services/AIEngineService';
import { AITaskType } from '../modules/ai/types';

export function registerAIWorker(): void {
  QueueService.createWorker(QueueNames.AI_GENERATION, async (job: Job) => {
    Logger.info('Processing AI generation job', { jobId: job.id, name: job.name });

    const engine = new AIEngineService();

    switch (job.name) {
      case 'generate-content': {
        const { websiteId, userId, businessName, category, location } = job.data;
        try {
          emitToUser(userId, 'ai:progress', { websiteId, step: 'Generating website content...', progress: 10 });

          const result = await engine.generate({
            taskType: AITaskType.WEBSITE_GENERATION,
            userId,
            websiteId,
            userPrompt: { businessName, category, location } as unknown as string,
            responseFormat: 'json_object',
          }, false);

          const { WebsiteRepository } = await import('../modules/website/repositories/WebsiteRepository');
          const repo = new WebsiteRepository();
          emitToUser(userId, 'ai:progress', { websiteId, step: 'Website content ready', progress: 100 });
          Logger.info('Website content generated via AI Engine', { websiteId, tokens: result.usage.totalTokens, cost: result.cost });
        } catch (err) {
          emitToUser(userId, 'ai:error', { websiteId, error: (err as Error).message });
          throw err;
        }
        break;
      }

      case 'generate-logo': {
        const { websiteId, businessName, userId } = job.data;
        try {
          emitToUser(userId, 'ai:progress', { websiteId, step: 'Generating logo...', progress: 30 });

          const result = await engine.generate({
            taskType: AITaskType.LOGO_GENERATION,
            userId,
            websiteId,
            userPrompt: `Create a professional logo for a business named "${businessName}". The logo should be modern, clean, and suitable for a professional website.`,
          }, false);

          const { WebsiteRepository } = await import('../modules/website/repositories/WebsiteRepository');
          const repo = new WebsiteRepository();
          const logoData = JSON.parse(result.content);

          await repo.updateBranding(websiteId, {
            logo: logoData.url || '',
            favicon: '',
            colors: {
              primary: '#3B82F6',
              primaryLight: '#60A5FA',
              primaryDark: '#2563EB',
              secondary: '#1E40AF',
              secondaryLight: '#3B82F6',
              accent: '#F59E0B',
              accentLight: '#FBBF24',
              background: '#FFFFFF',
              surface: '#F8FAFC',
              surfaceAlt: '#F1F5F9',
              text: '#0F172A',
              textSecondary: '#64748B',
              textInverse: '#FFFFFF',
              border: '#E2E8F0',
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
                primary: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
                secondary: 'linear-gradient(135deg, #1E40AF, #F59E0B)',
                accent: 'linear-gradient(135deg, #F59E0B, #EF4444)',
              },
            },
            fonts: { heading: 'Inter', body: 'Inter' },
            spacing: { sectionPadding: '5rem', sectionMargin: '0', elementGap: '1.5rem', containerWidth: '1200px' },
            borderRadius: '0.5rem',
            shadows: { small: '0 1px 2px rgba(0,0,0,0.05)', medium: '0 4px 6px rgba(0,0,0,0.1)', large: '0 10px 15px rgba(0,0,0,0.1)', focus: '0 20px 25px rgba(0,0,0,0.15)' },
            animations: { section: 'fade-up', card: 'fade-up', hover: 'scale(1.05)', hero: 'fade-up', duration: 300 },
            logoStyle: 'modern',
            brandVoice: 'professional',
            tagline: '',
            mission: '',
          });

          emitToUser(userId, 'ai:progress', { websiteId, step: 'Logo ready', progress: 100 });
          Logger.info('Logo generated via AI Engine', { websiteId });
        } catch (err) {
          emitToUser(userId, 'ai:error', { websiteId, error: (err as Error).message });
          throw err;
        }
        break;
      }

      case 'growth-analysis': {
        const { websiteId, userId } = job.data;
        try {
          const { GrowthService } = await import('../modules/growth/services/GrowthService');
          const growthService = new GrowthService();
          await growthService.generateReport(websiteId, userId);
          Logger.info('Growth analysis completed', { websiteId });
        } catch (err) {
          Logger.error('Growth analysis failed', { websiteId, error: (err as Error).message });
          throw err;
        }
        break;
      }

      case 'website-content-generation': {
        const { websiteId, userId, businessName, category, location, template } = job.data;
        try {
          emitToUser(userId, 'ai:progress', { websiteId, step: 'Generating full website...', progress: 10 });

          const result = await engine.generate({
            taskType: AITaskType.WEBSITE_GENERATION,
            userId,
            websiteId,
            userPrompt: { businessName, category, location, template } as unknown as string,
            responseFormat: 'json_object',
          }, false);

          emitToUser(userId, 'ai:progress', { websiteId, step: 'Website generation complete', progress: 100 });
          Logger.info('Website content generated', { websiteId, tokens: result.usage.totalTokens, cost: result.cost });
        } catch (err) {
          emitToUser(userId, 'ai:error', { websiteId, error: (err as Error).message });
          throw err;
        }
        break;
      }

      default:
        Logger.warn('Unknown AI job type', { name: job.name });
    }
  }, 5);
}
