import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../types/express';
import { AIEngineService } from '../services/AIEngineService';
import { TokenUsageService } from '../services/TokenUsageService';
import { AICreditService } from '../services/AICreditService';
import { PromptTemplateService } from '../services/PromptTemplateService';
import { AITaskType } from '../types';
import { AppError } from '../../../utils/AppError';

const engine = new AIEngineService();
const tokenUsage = new TokenUsageService();
const credits = new AICreditService();
const promptTemplates = new PromptTemplateService();

export class AIController {
  static generate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { taskType, prompt, websiteId, model, temperature, maxTokens, responseFormat, cacheKey, cacheTtl } = req.body;

      if (!taskType || !prompt) {
        throw new AppError('taskType and prompt are required', 400);
      }

      if (!Object.values(AITaskType).includes(taskType)) {
        throw new AppError(`Invalid taskType. Must be one of: ${Object.values(AITaskType).join(', ')}`, 400);
      }

      const creditCheck = await engine.checkCredits(userId, taskType);
      if (!creditCheck.sufficient) {
        throw new AppError(`Insufficient AI credits. Required: ${creditCheck.required}, Available: ${creditCheck.available}`, 402);
      }

      const result = await engine.generate({
        taskType,
        userId,
        websiteId,
        userPrompt: prompt,
        model,
        temperature,
        maxTokens,
        responseFormat,
        cacheKey,
        cacheTtl,
      });

      res.json({
        success: true,
        data: {
          content: result.content,
          model: result.model,
          usage: result.usage,
          cost: result.cost,
          cached: result.cached,
          latency: result.latency,
        },
        message: `${taskType} generated successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  static generateStream = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { taskType, prompt, websiteId, model, temperature, maxTokens } = req.body;

      if (!taskType || !prompt) {
        throw new AppError('taskType and prompt are required', 400);
      }

      if (!Object.values(AITaskType).includes(taskType)) {
        throw new AppError(`Invalid taskType. Must be one of: ${Object.values(AITaskType).join(', ')}`, 400);
      }

      const creditCheck = await engine.checkCredits(userId, taskType);
      if (!creditCheck.sufficient) {
        throw new AppError(`Insufficient AI credits. Required: ${creditCheck.required}, Available: ${creditCheck.available}`, 402);
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');

      const onChunk = (chunk: string) => {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      };

      const result = await engine.generateStream(
        { taskType, userId, websiteId, userPrompt: prompt, model, temperature, maxTokens },
        onChunk,
        false
      );

      res.write(`data: ${JSON.stringify({ type: 'done', ...result })}\n\n`);
      res.end();
    } catch (error) {
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: (error as Error).message })}\n\n`);
        res.end();
      } else {
        next(error);
      }
    }
  };

  static getUsage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const summary = await tokenUsage.getUserSummary(userId);
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  };

  static getAdminUsage = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user!.role !== 'admin') {
        throw new AppError('Admin access required', 403);
      }
      const { start, end } = req.query;
      const timeRange = start && end
        ? { start: new Date(start as string), end: new Date(end as string) }
        : undefined;
      const summary = await tokenUsage.getAdminSummary(timeRange);
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  };

  static getCreditBalance = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const balance = await credits.getBalance(userId);
      res.json({ success: true, data: balance });
    } catch (error) {
      next(error);
    }
  };

  static getCreditHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;
      const history = await credits.getTransactionHistory(userId, limit, skip);
      res.json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  };

  static purchaseCredits = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { package: pkg, paymentId } = req.body;

      if (!pkg || !paymentId) {
        throw new AppError('package and paymentId are required', 400);
      }

      const options = await credits.getTopUpOptions();
      const selected = options[pkg];
      if (!selected) {
        throw new AppError(`Invalid package. Options: ${Object.keys(options).join(', ')}`, 400);
      }

      const balance = await credits.addCredits(
        userId,
        selected.credits,
        'purchase',
        `Purchased ${selected.credits} credits (${pkg})`,
        paymentId
      );

      res.json({
        success: true,
        data: { balance, creditsAdded: selected.credits, amount: selected.price },
        message: `${selected.credits} credits added successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  static getCreditOptions = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const options = await credits.getTopUpOptions();
      const planCredits = credits.getPlanCredits();
      res.json({
        success: true,
        data: {
          topUpOptions: options,
          planCredits,
          taskCosts: engine.getCreditCosts(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  static getTaskCosts = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        data: {
          taskCosts: engine.getCreditCosts(),
          models: engine.getModels(),
          defaultMaxTokens: engine.getDefaultMaxTokens(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  static checkCredits = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { taskType } = req.params;

      if (!Object.values(AITaskType).includes(taskType as AITaskType)) {
        throw new AppError(`Invalid taskType. Must be one of: ${Object.values(AITaskType).join(', ')}`, 400);
      }

      const check = await engine.checkCredits(userId, taskType as AITaskType);
      res.json({ success: true, data: check });
    } catch (error) {
      next(error);
    }
  };

  static generateWebsiteContent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { websiteId } = req.params;
      const { businessName, category, location } = req.body;

      const result = await engine.generate({
        taskType: AITaskType.WEBSITE_GENERATION,
        userId,
        websiteId,
        userPrompt: JSON.stringify({ businessName, category, location }) as unknown as string,
        responseFormat: 'json_object',
      });

      res.json({
        success: true,
        data: { content: JSON.parse(result.content), usage: result.usage, cost: result.cost },
        message: 'Website content generated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  static generateSeoMetadata = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { businessName, category, location, services, audience } = req.body;

      const result = await engine.generate({
        taskType: AITaskType.SEO_METADATA,
        userId,
        userPrompt: JSON.stringify({ businessName, category, location, services, audience }) as unknown as string,
        responseFormat: 'json_object',
      });

      res.json({
        success: true,
        data: { content: JSON.parse(result.content), usage: result.usage, cost: result.cost },
        message: 'SEO metadata generated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  static generateBlog = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { businessName, category, topic, audience, tone } = req.body;

      const result = await engine.generate({
        taskType: AITaskType.BLOG_GENERATION,
        userId,
        userPrompt: JSON.stringify({ businessName, category, topic, audience, tone }) as unknown as string,
        responseFormat: 'json_object',
      });

      res.json({
        success: true,
        data: { content: JSON.parse(result.content), usage: result.usage, cost: result.cost },
        message: 'Blog post generated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  static generateFaq = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { businessName, category, location, count, topics } = req.body;

      const result = await engine.generate({
        taskType: AITaskType.FAQ_GENERATION,
        userId,
        userPrompt: JSON.stringify({ businessName, category, location, count: count?.toString() || '5', topics }) as unknown as string,
        responseFormat: 'json_object',
      });

      res.json({
        success: true,
        data: { content: JSON.parse(result.content), usage: result.usage, cost: result.cost },
        message: 'FAQs generated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  static generateMarketingCopy = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { businessName, category, location, goal, channels, usp, audience } = req.body;

      const result = await engine.generate({
        taskType: AITaskType.MARKETING_COPY,
        userId,
        userPrompt: JSON.stringify({ businessName, category, location, goal, channels, usp, audience }) as unknown as string,
        responseFormat: 'json_object',
      });

      res.json({
        success: true,
        data: { content: JSON.parse(result.content), usage: result.usage, cost: result.cost },
        message: 'Marketing copy generated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  static savePromptTemplate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user!.role !== 'admin') {
        throw new AppError('Admin access required', 403);
      }

      await promptTemplates.createOrUpdateTemplate(req.body);
      res.json({ success: true, message: 'Prompt template saved successfully' });
    } catch (error) {
      next(error);
    }
  };

  static getBuiltInTemplates = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const templates = await promptTemplates.getBuiltInTemplates();
      res.json({ success: true, data: templates });
    } catch (error) {
      next(error);
    }
  };
}
