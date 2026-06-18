import { Logger } from '../../../core/logging/Logger';
import { PromptTemplate } from '../models/PromptTemplate';
import { AITaskType } from '../types';

interface CompiledPrompt {
  systemPrompt: string;
  userPrompt: string;
}

const BUILT_IN_TEMPLATES: Record<string, { systemPrompt: string; userPromptTemplate: string; variables: string[] }> = {
  'website-content': {
    systemPrompt: `You are an expert website content writer. Generate comprehensive, professional website content for a business. Return valid JSON with the following structure:
{
  "headline": "string (catchy headline under 100 chars)",
  "subheadline": "string (supporting tagline under 150 chars)",
  "about": "string (2-3 paragraphs about the business, 300-500 words)",
  "services": [{ "title": "string", "description": "string" }],
  "faq": [{ "question": "string", "answer": "string" }],
  "testimonials": [{ "name": "string", "role": "string", "content": "string" }]
}`,
    userPromptTemplate: `Generate website content for a business named "{{businessName}}" in the "{{category}}" category located in "{{location}}". Make the content professional, engaging, and optimized for {{category}} businesses. Include 4-6 services, 3-5 FAQs, and 2-3 testimonials.`,
    variables: ['businessName', 'category', 'location'],
  },
  'seo-metadata': {
    systemPrompt: `You are an SEO expert. Generate optimized meta titles, descriptions, and keywords for a business website. Return valid JSON with:
{
  "metaTitle": "string (under 60 chars)",
  "metaDescription": "string (under 160 chars)",
  "keywords": ["string"],
  "ogTitle": "string",
  "ogDescription": "string"
}`,
    userPromptTemplate: `Generate SEO metadata for "{{businessName}}" — a {{category}} business in {{location}}. Key services include: {{services}}. Target audience: {{audience}}.`,
    variables: ['businessName', 'category', 'location', 'services', 'audience'],
  },
  'blog-post': {
    systemPrompt: `You are a professional content writer. Write an engaging, well-structured blog post. Return valid JSON with:
{
  "title": "string (SEO-optimized, under 70 chars)",
  "slug": "string (url-friendly)",
  "excerpt": "string (under 160 chars)",
  "content": "string (full markdown article, 800-1500 words)",
  "tags": ["string"],
  "metaDescription": "string (under 160 chars)"
}`,
    userPromptTemplate: `Write a blog post for "{{businessName}}", a {{category}} business. Topic: {{topic}}. Target audience: {{audience}}. Tone: {{tone}}. Include actionable advice and industry-specific insights.`,
    variables: ['businessName', 'category', 'topic', 'audience', 'tone'],
  },
  'faq-generation': {
    systemPrompt: `You are a helpful assistant that generates FAQ content for business websites. Return valid JSON with:
{
  "faqs": [{ "question": "string", "answer": "string (2-4 sentences)" }]
}`,
    userPromptTemplate: `Generate {{count}} frequently asked questions and answers for "{{businessName}}", a {{category}} business in {{location}}. Address common customer concerns about: {{topics}}.`,
    variables: ['businessName', 'category', 'location', 'count', 'topics'],
  },
  'marketing-copy': {
    systemPrompt: `You are a marketing copywriter. Write compelling marketing copy. Return valid JSON with:
{
  "headline": "string (catchy, under 80 chars)",
  "subheadline": "string (supporting, under 120 chars)",
  "body": "string (2-3 paragraphs)",
  "cta": "string (call to action, under 50 chars)",
  "valuePropositions": ["string"],
  "targetAudienceNote": "string"
}`,
    userPromptTemplate: `Write marketing copy for "{{businessName}}" — a {{category}} business in {{location}}. Campaign goal: {{goal}}. Channels: {{channels}}. Unique selling points: {{usp}}. Target audience: {{audience}}.`,
    variables: ['businessName', 'category', 'location', 'goal', 'channels', 'usp', 'audience'],
  },
  'chatbot-system': {
    systemPrompt: `You are a helpful, friendly AI assistant for {{businessName}}. Answer customer questions about the business professionally and concisely. If you cannot answer a question, politely ask for more details. Keep responses under 150 words. Business context: {{businessContext}}.`,
    userPromptTemplate: `Customer question: {{message}}`,
    variables: ['businessName', 'businessContext', 'message'],
  },
  'growth-analysis': {
    systemPrompt: `You are a business growth consultant. Analyze the provided metrics and return JSON with:
{
  "summary": "string (2-3 sentence executive summary)",
  "recommendedActions": [{ "priority": "high|medium|low", "action": "string", "expectedImpact": "string" }],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "opportunities": ["string"]
}`,
    userPromptTemplate: `Analyze this {{category}} business's weekly performance data:
Scores: {{scores}}
Traffic: {{traffic}} visitors, {{pageViews}} page views, {{bounceRate}}% bounce rate
Leads: {{leads}} total, {{conversionRate}}% conversion rate
Top Pages: {{topPages}}`,
    variables: ['category', 'scores', 'traffic', 'pageViews', 'bounceRate', 'leads', 'conversionRate', 'topPages'],
  },
};

export class PromptTemplateService {
  async getPrompt(taskType: AITaskType, templateName?: string): Promise<{ systemPrompt: string; userPromptTemplate: string; variables: string[] } | null> {
    if (templateName) {
      const dbTemplate = await PromptTemplate.findOne({ name: templateName, isActive: true }).lean();
      if (dbTemplate) {
        return {
          systemPrompt: dbTemplate.systemPrompt,
          userPromptTemplate: dbTemplate.userPromptTemplate,
          variables: dbTemplate.variables || [],
        };
      }
    }

    const dbTemplate = await PromptTemplate.findOne({ taskType, isActive: true })
      .sort({ version: -1 })
      .lean();

    if (dbTemplate) {
      return {
        systemPrompt: dbTemplate.systemPrompt,
        userPromptTemplate: dbTemplate.userPromptTemplate,
        variables: dbTemplate.variables || [],
      };
    }

    const builtIn = BUILT_IN_TEMPLATES[taskType];
    if (!builtIn) {
      Logger.warn('No prompt template found for task type', { taskType });
      return null;
    }

    return builtIn;
  }

  compile(template: { systemPrompt: string; userPromptTemplate: string; variables: string[] }, variables: Record<string, string>): CompiledPrompt {
    let userPrompt = template.userPromptTemplate;

    for (const variable of template.variables) {
      const value = variables[variable] || '';
      userPrompt = userPrompt.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    }

    return {
      systemPrompt: this.interpolateSystemPrompt(template.systemPrompt, variables),
      userPrompt,
    };
  }

  private interpolateSystemPrompt(systemPrompt: string, variables: Record<string, string>): string {
    let result = systemPrompt;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  async createOrUpdateTemplate(data: {
    name: string;
    taskType: AITaskType;
    systemPrompt: string;
    userPromptTemplate: string;
    description?: string;
    variables?: string[];
    defaultModel?: string;
    defaultTemperature?: number;
    defaultMaxTokens?: number;
  }): Promise<void> {
    const existing = await PromptTemplate.findOne({ name: data.name });
    if (existing) {
      await PromptTemplate.updateOne(
        { name: data.name },
        {
          $set: {
            systemPrompt: data.systemPrompt,
            userPromptTemplate: data.userPromptTemplate,
            description: data.description,
            variables: data.variables || [],
            defaultModel: data.defaultModel,
            defaultTemperature: data.defaultTemperature,
            defaultMaxTokens: data.defaultMaxTokens,
          },
          $inc: { version: 1 },
        }
      );
    } else {
      await PromptTemplate.create({
        name: data.name,
        taskType: data.taskType,
        systemPrompt: data.systemPrompt,
        userPromptTemplate: data.userPromptTemplate,
        description: data.description,
        variables: data.variables || [],
        defaultModel: data.defaultModel,
        defaultTemperature: data.defaultTemperature ?? 0.7,
        defaultMaxTokens: data.defaultMaxTokens ?? 2000,
      });
    }
  }

  async getBuiltInTemplates(): Promise<typeof BUILT_IN_TEMPLATES> {
    return BUILT_IN_TEMPLATES;
  }
}
