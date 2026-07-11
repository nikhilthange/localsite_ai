import { AIClient } from '../../../ai/services/AIClient';
import type { AiGeneratedWebsite } from '../../../../types/website';
import { WebsiteGenerationPipeline } from './WebsiteGenerationPipeline';
import { WebsiteGenerationContext } from './PromptBuilder';
import { ProgressEmitter } from './ProgressEmitter';
import { FallbackGenerator } from './FallbackGenerator';
import { Logger } from '../../../../core/logging/Logger';

export class AIOrchestrator {
  private aiClient: AIClient;
  private fallbackGenerator = new FallbackGenerator();

  constructor() {
    this.aiClient = new AIClient();
  }

  async generateWebsite(
    userId: string,
    websiteId: string,
    businessName: string,
    category: string,
    location: string,
    phone: string,
    email: string,
    description: string,
    theme: string,
    primaryColor?: string,
    secondaryColor?: string,
    targetAudience?: string,
    tone?: string,
    websiteStyle?: string
  ): Promise<AiGeneratedWebsite> {
    const progressEmitter = new ProgressEmitter(userId, websiteId);
    
    progressEmitter.emitProgress('Creating website...', 5);

    const pipeline = new WebsiteGenerationPipeline(this.aiClient, progressEmitter);

    const context: WebsiteGenerationContext = {
      businessName,
      category,
      location,
      phone,
      email,
      description,
      theme,
      primaryColor,
      secondaryColor,
      targetAudience,
      tone,
      websiteStyle,
      accumulatedData: {}
    };

    try {
      Logger.info('Starting AI Generation Pipeline', { businessName, websiteId });
      const generatedWebsite = await pipeline.execute(context);
      progressEmitter.emitProgress('Completed.', 100);
      return generatedWebsite;
    } catch (error: any) {
      Logger.error('AI Generation Pipeline failed, falling back to template', { 
        businessName, 
        websiteId, 
        error: error.message 
      });
      
      // Notify the frontend that we encountered an error but are recovering
      progressEmitter.emitProgress('AI generation failed. Applying fallback template...', 90);
      
      const fallback = this.fallbackGenerator.generateFallback(
        businessName, 
        category, 
        location, 
        phone, 
        email, 
        description
      );

      progressEmitter.emitProgress('Completed.', 100);
      return fallback;
    }
  }
}
