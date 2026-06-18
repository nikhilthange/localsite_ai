export enum AITaskType {
  WEBSITE_GENERATION = 'website-generation',
  SEO_METADATA = 'seo-metadata',
  LOGO_GENERATION = 'logo-generation',
  BLOG_GENERATION = 'blog-generation',
  FAQ_GENERATION = 'faq-generation',
  MARKETING_COPY = 'marketing-copy',
  CHATBOT_RESPONSE = 'chatbot-response',
  GROWTH_ANALYSIS = 'growth-analysis',
}

export enum AIModel {
  GPT4o = 'gpt-4o',
  GPT4oMini = 'gpt-4o-mini',
  Dalle3 = 'dall-e-3',
}

export const MODEL_COSTS: Record<AIModel, { input: number; output: number }> = {
  [AIModel.GPT4o]: { input: 0.0000025, output: 0.00001 },
  [AIModel.GPT4oMini]: { input: 0.00000015, output: 0.0000006 },
  [AIModel.Dalle3]: { input: 0, output: 0.04 },
};

export const TASK_MODEL_MAP: Record<AITaskType, AIModel> = {
  [AITaskType.WEBSITE_GENERATION]: AIModel.GPT4o,
  [AITaskType.SEO_METADATA]: AIModel.GPT4oMini,
  [AITaskType.LOGO_GENERATION]: AIModel.Dalle3,
  [AITaskType.BLOG_GENERATION]: AIModel.GPT4o,
  [AITaskType.FAQ_GENERATION]: AIModel.GPT4oMini,
  [AITaskType.MARKETING_COPY]: AIModel.GPT4o,
  [AITaskType.CHATBOT_RESPONSE]: AIModel.GPT4oMini,
  [AITaskType.GROWTH_ANALYSIS]: AIModel.GPT4oMini,
};

export const TASK_CREDIT_COSTS: Record<AITaskType, number> = {
  [AITaskType.WEBSITE_GENERATION]: 50,
  [AITaskType.SEO_METADATA]: 5,
  [AITaskType.LOGO_GENERATION]: 25,
  [AITaskType.BLOG_GENERATION]: 20,
  [AITaskType.FAQ_GENERATION]: 10,
  [AITaskType.MARKETING_COPY]: 15,
  [AITaskType.CHATBOT_RESPONSE]: 1,
  [AITaskType.GROWTH_ANALYSIS]: 10,
};

export const TASK_DEFAULT_MAX_TOKENS: Record<AITaskType, number> = {
  [AITaskType.WEBSITE_GENERATION]: 4000,
  [AITaskType.SEO_METADATA]: 500,
  [AITaskType.LOGO_GENERATION]: 1000,
  [AITaskType.BLOG_GENERATION]: 2000,
  [AITaskType.FAQ_GENERATION]: 1500,
  [AITaskType.MARKETING_COPY]: 1500,
  [AITaskType.CHATBOT_RESPONSE]: 500,
  [AITaskType.GROWTH_ANALYSIS]: 1000,
};

export interface AICompletionRequest {
  taskType: AITaskType;
  userId: string;
  websiteId?: string;
  model?: AIModel;
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  responseFormat?: 'json_object' | 'text';
  cacheKey?: string;
  cacheTtl?: number;
}

export interface AICompletionResponse {
  content: string;
  model: AIModel;
  taskType: AITaskType;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  cached: boolean;
  latency: number;
}

export interface AICreditBalance {
  userId: string;
  balance: number;
  lifetimeUsed: number;
  lifetimePurchased: number;
}

export interface AICreditTransaction {
  userId: string;
  amount: number;
  type: 'consumption' | 'purchase' | 'bonus' | 'refund' | 'subscription_allotment';
  taskType?: AITaskType;
  description: string;
  referenceId?: string;
}

export interface TokenUsageRecord {
  userId: string;
  websiteId?: string;
  taskType: AITaskType;
  model: AIModel;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  creditsConsumed: number;
  latency: number;
  cached: boolean;
  success: boolean;
  error?: string;
}

export interface AiUsageSummary {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  totalCreditsConsumed: number;
  byTaskType: Record<AITaskType, { requests: number; tokens: number; cost: number }>;
  byModel: Record<AIModel, { requests: number; tokens: number; cost: number }>;
}
