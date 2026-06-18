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
          const content = JSON.parse(result.content);
          await repo.updateContent(websiteId, {
            headline: content.headline || `Welcome to ${businessName}`,
            subheadline: content.subheadline || `Your trusted ${category} partner`,
            about: content.about || '',
            services: (content.services || []).map((s: any) => ({
              title: s.title,
              description: s.description,
            })),
            gallery: [],
            testimonials: (content.testimonials || []).map((t: any) => ({
              name: t.name || 'Client',
              role: t.role || '',
              content: t.content || '',
            })),
            faq: (content.faq || []).map((f: any) => ({
              question: f.question,
              answer: f.answer,
            })),
            seo: {
              metaTitle: `${businessName} | ${category}`,
              metaDescription: `Professional ${category} services by ${businessName}`,
              keywords: [],
              sitemapIncluded: true,
            },
          });

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
            logoVariations: [],
            favicon: '',
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
            accentColor: '#F59E0B',
            font: 'Inter',
            borderRadius: '0.5rem',
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

          const { WebsiteRepository } = await import('../modules/website/repositories/WebsiteRepository');
          const repo = new WebsiteRepository();
          const content = JSON.parse(result.content);

          await repo.updateContent(websiteId, {
            headline: content.headline || `Welcome to ${businessName}`,
            subheadline: content.subheadline || '',
            about: content.about || '',
            services: (content.services || []).map((s: any) => ({ title: s.title, description: s.description })),
            gallery: [],
            testimonials: (content.testimonials || []).map((t: any) => ({
              name: t.name || 'Client',
              role: t.role || '',
              content: t.content || '',
            })),
            faq: (content.faq || []).map((f: any) => ({ question: f.question, answer: f.answer })),
            seo: {
              metaTitle: `${businessName} | ${category}`,
              metaDescription: `Professional ${category} services by ${businessName}`,
              keywords: [],
              sitemapIncluded: true,
            },
          });

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
