import NvidiaAI from 'openai';
import { config } from '../../../config';
import { WebsiteRepository } from '../repositories/WebsiteRepository';
import { Logger } from '../../../core/logging/Logger';

const nvidia = new NvidiaAI({
  apiKey: config.nvidia.apiKey,
  baseURL: config.nvidia.baseUrl,
});
const repository = new WebsiteRepository();

const SYSTEM_PROMPT = `You are an expert website content writer. Generate comprehensive website content for a business.
Return valid JSON with the following structure:
{
  "headline": "string",
  "subheadline": "string",
  "about": "string (2-3 paragraphs)",
  "services": [{ "title": "string", "description": "string" }],
  "faq": [{ "question": "string", "answer": "string" }],
  "testimonials": [{ "name": "string", "role": "string", "content": "string" }]
}`;

export class WebsiteContentService {
  static async generateWebsiteContent(websiteId: string): Promise<void> {
    const website = await repository.findById(websiteId);
    if (!website) throw new Error('Website not found');

    const userPrompt = `Generate website content for a business named "${website.businessName}" in the "${website.category}" category located in "${website.location}". Make the content professional, engaging, and relevant to ${website.category} businesses.`;

    const response = await nvidia.chat.completions.create({
      model: config.nvidia.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: config.nvidia.maxTokens,
      temperature: config.nvidia.temperature,
      response_format: { type: 'json_object' },
    });

    const content = JSON.parse(response.choices[0]?.message?.content || '{}');

    await repository.updateContent(websiteId, {
      headline: content.headline || `Welcome to ${website.businessName}`,
      subheadline: content.subheadline || `Your trusted ${website.category} partner`,
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
        metaTitle: `${website.businessName} | ${website.category}`,
        metaDescription: `Professional ${website.category} services by ${website.businessName}`,
        keywords: [],
        sitemapIncluded: true,
      },
    });

    Logger.info('AI content generated', { websiteId });
  }
}
