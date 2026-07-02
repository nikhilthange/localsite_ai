import { GrowthRepository } from '../repositories/GrowthRepository';
import { WeeklyReport } from '../models/WeeklyReport';
import { BusinessInsight } from '../models/BusinessInsight';
import { Website } from '../../website/models/Website';
import { User } from '../../auth/models/User';
import { Analytics } from '../../analytics/models/Analytics';
import { Lead } from '../../lead/models/Lead';
import { EventBus } from '../../../core/events/EventBus';
import { SystemEvents } from '../../../types/events';
import type { PaginationParams } from '../../../types/services';
import { AppError } from '../../../utils/AppError';
import NvidiaAI from 'openai';
import { Types } from 'mongoose';

const nvidia = new NvidiaAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
});

export class GrowthService {
  private repository: GrowthRepository;

  constructor() {
    this.repository = new GrowthRepository();
  }

  async getDashboard(userId: string) {
    const websites = await Website.find({ userId }).lean();
    const [reports, unreadCount] = await Promise.all([
      Promise.all(websites.map((w) => this.repository.getLatestReport(w._id))),
      this.repository.getUnreadInsightCount(userId),
    ]);
    const trends = await Promise.all(
      websites.map((w) => this.repository.getWeeklyTrends(w._id, 4))
    );
    return {
      websites: websites.map((w, i) => ({
        website: w,
        latestReport: reports[i],
        trends: trends[i],
      })),
      unreadInsights: unreadCount,
    };
  }

  async getWebsiteDashboard(websiteId: string, userId: string) {
    const website = await Website.findOne({ _id: websiteId, userId }).lean();
    if (!website) throw new AppError('Website not found', 404);
    const [latestReport, trends, unreadInsights] = await Promise.all([
      this.repository.getLatestReport(websiteId),
      this.repository.getWeeklyTrends(websiteId, 8),
      this.repository.getUnreadInsightCount(userId),
    ]);
    return { website, latestReport, trends, unreadInsights };
  }

  async generateReport(websiteId: string, userId: string) {
    const website = await Website.findOne({ _id: websiteId, userId }).lean();
    if (!website) throw new AppError('Website not found', 404);

    const now = new Date();
    const weekEnd = new Date(now);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    weekEnd.setHours(23, 59, 59, 999);

    const [trafficData, leadData] = await Promise.all([
      Analytics.aggregate([
        { $match: { websiteId: new Types.ObjectId(websiteId), timestamp: { $gte: weekStart, $lte: weekEnd } } },
        {
          $group: {
            _id: null,
            totalVisitors: { $addToSet: '$visitorId' },
            totalPageViews: { $sum: 1 },
            avgDuration: { $avg: '$duration' },
            bounceRate: { $avg: { $cond: ['$bounce', 1, 0] } },
          },
        },
      ]),
      Lead.find({ website: websiteId, createdAt: { $gte: weekStart, $lte: weekEnd } }).lean(),
    ]);

    const traffic = trafficData[0] || { totalVisitors: [], totalPageViews: 0, avgDuration: 0, bounceRate: 0 };
    const topPages = await Analytics.aggregate([
      { $match: { websiteId: new Types.ObjectId(websiteId), timestamp: { $gte: weekStart, $lte: weekEnd } } },
      { $group: { _id: '$page', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ]);

    const trafficSources = await Analytics.aggregate([
      { $match: { websiteId: new Types.ObjectId(websiteId), timestamp: { $gte: weekStart, $lte: weekEnd } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const leadsTotal = leadData.length;
    const leadsConverted = leadData.filter((l) => l.status === 'converted').length;
    const conversionRate = leadsTotal > 0 ? Math.round((leadsConverted / leadsTotal) * 10000) / 100 : 0;

    const bHealth = Math.min(100, Math.round(
      (traffic.totalVisitors.length > 50 ? 40 : (traffic.totalVisitors.length / 50) * 40) +
      (leadsTotal > 5 ? 30 : (leadsTotal / 5) * 30) +
      (conversionRate > 5 ? 30 : (conversionRate / 5) * 30)
    ));
    const seoScore = Math.min(100, Math.round(
      (website.content?.seo?.metaTitle ? 30 : 0) +
      (website.content?.seo?.metaDescription ? 30 : 0) +
      ((website.content?.seo?.keywords?.length || 0) > 0 ? 20 : 0) +
      (website.content?.seo?.structuredData ? 20 : 0)
    ));
    const leadScore = Math.min(100, Math.round(
      (leadsTotal > 10 ? 50 : (leadsTotal / 10) * 50) +
      (conversionRate > 10 ? 50 : (conversionRate / 10) * 50)
    ));
    const convScore = Math.min(100, Math.round(conversionRate * 10));
    const satScore = Math.min(100, Math.round(bHealth));

    let aiResult: any;
    try {
      const response = await nvidia.chat.completions.create({
        model: process.env.NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a business growth consultant. Analyze the data and return JSON with summary and recommendedActions array.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              scores: { businessHealth: bHealth, seo: seoScore, leads: leadScore, conversion: convScore, satisfaction: satScore },
              traffic: { visitors: traffic.totalVisitors.length, pageViews: traffic.totalPageViews, bounceRate: Math.round(traffic.bounceRate * 100) / 100 },
              leads: { total: leadsTotal, converted: leadsConverted, conversionRate },
              topPages: topPages.map((p) => ({ page: p._id, views: p.views })),
            }),
          },
        ],
        response_format: { type: 'json_object' },
      });
      aiResult = JSON.parse(response.choices[0].message.content || '{}');
    } catch {
      aiResult = {
        summary: `Business health is ${bHealth >= 70 ? 'strong' : 'moderate'}. Focus on ${seoScore < 70 ? 'SEO improvements' : 'lead generation'}.`,
        recommendedActions: [],
      };
    }

    const report = await WeeklyReport.create({
      userId: new Types.ObjectId(userId),
      websiteId: new Types.ObjectId(websiteId),
      weekStart,
      weekEnd,
      scores: { businessHealth: bHealth, seo: seoScore, leads: leadScore, conversion: convScore, satisfaction: satScore },
      traffic: {
        totalVisitors: traffic.totalVisitors.length,
        totalPageViews: traffic.totalPageViews,
        avgSessionDuration: Math.round(traffic.avgDuration),
        bounceRate: Math.round(traffic.bounceRate * 100) / 100,
        topPages: topPages.map((p) => ({ page: p._id, views: p.views })),
        trafficSources: trafficSources.map((s) => ({ source: s._id || 'direct', count: s.count })),
      },
      leads: { total: leadsTotal, new: leadData.filter((l) => l.status === 'new').length, contacted: leadData.filter((l) => l.status === 'contacted').length, converted: leadsConverted, conversionRate, topSources: [] },
      recommendations: aiResult.recommendedActions || [],
      summary: aiResult.summary || '',
      aiGenerated: true,
      emailed: false,
    });

    await BusinessInsight.create({
      userId: new Types.ObjectId(userId),
      websiteId: new Types.ObjectId(websiteId),
      category: 'general',
      severity: bHealth >= 70 ? 'low' : bHealth >= 40 ? 'medium' : 'high',
      title: `Weekly Report: Score ${bHealth}/100`,
      description: aiResult.summary || 'Your weekly report is ready.',
      metric: { name: 'Business Health', current: bHealth, previous: 0, change: 0, unit: 'score' },
      read: false,
      dismissed: false,
    });

    EventBus.emit(SystemEvents.GROWTH_REPORT_GENERATED, {
      reportId: report._id.toString(),
      userId,
      websiteId,
      scores: report.scores,
      timestamp: new Date(),
    });

    return report;
  }

  async getReports(websiteId: string, userId: string, params: PaginationParams) {
    const website = await Website.findOne({ _id: websiteId, userId }).lean();
    if (!website) throw new AppError('Website not found', 404);
    return this.repository.getReportsByWebsite(websiteId, params);
  }

  async getReportDetail(reportId: string, userId: string) {
    const report = await this.repository.getReportById(reportId);
    if (!report) throw new AppError('Report not found', 404);
    const website = await Website.findOne({ _id: report.websiteId, userId }).lean();
    if (!website) throw new AppError('Unauthorized', 403);
    return report;
  }

  async getTrends(websiteId: string, userId: string, weeks: number = 8) {
    const website = await Website.findOne({ _id: websiteId, userId }).lean();
    if (!website) throw new AppError('Website not found', 404);
    const reports = await this.repository.getWeeklyTrends(websiteId, weeks);
    return {
      labels: reports.map((r) => r.weekStart?.toISOString().slice(0, 10) || '').reverse(),
      businessHealth: reports.map((r) => r.scores.businessHealth).reverse(),
      seo: reports.map((r) => r.scores.seo).reverse(),
      leads: reports.map((r) => r.scores.leads).reverse(),
      conversion: reports.map((r) => r.scores.conversion).reverse(),
      satisfaction: reports.map((r) => r.scores.satisfaction).reverse(),
    };
  }

  async getInsights(userId: string, websiteId?: string, params: PaginationParams & { read?: boolean; dismissed?: boolean } = {}) {
    return this.repository.getInsights(userId, { ...params, websiteId });
  }

  async markInsightRead(insightId: string, userId: string) {
    const insight = await BusinessInsight.findOne({ _id: insightId, userId }).lean();
    if (!insight) throw new AppError('Insight not found', 404);
    return this.repository.markInsightRead(insightId);
  }

  async markInsightDismissed(insightId: string, userId: string) {
    const insight = await BusinessInsight.findOne({ _id: insightId, userId }).lean();
    if (!insight) throw new AppError('Insight not found', 404);
    return this.repository.markInsightDismissed(insightId);
  }

  async runWeeklyAnalysis() {
    const websites = await Website.find({ status: 'published' }).lean();
    for (const website of websites) {
      try {
        await this.generateReport(website._id.toString(), website.userId.toString());
      } catch (err) {
        console.error(`Weekly report failed for website ${website._id}:`, (err as Error).message);
      }
    }
  }

  async runDailyInsights() {
    const websites = await Website.find({ status: 'published' }).lean();
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const website of websites) {
      try {
        const pageViews = await Analytics.countDocuments({
          websiteId: website._id,
          timestamp: { $gte: yesterday, $lte: now },
        });
        const newLeads = await Lead.countDocuments({
          website: website._id,
          createdAt: { $gte: yesterday, $lte: now },
        });

        if (pageViews > 50) {
          await BusinessInsight.create({
            userId: website.userId,
            websiteId: website._id,
            category: 'traffic',
            severity: pageViews > 200 ? 'medium' : 'low',
            title: `${pageViews} page views yesterday`,
            description: `Your website received ${pageViews} page views in the last 24 hours.`,
            metric: { name: 'Daily Page Views', current: pageViews, previous: 0, change: 0, unit: 'views' },
          });
        }
        if (newLeads > 0) {
          await BusinessInsight.create({
            userId: website.userId,
            websiteId: website._id,
            category: 'leads',
            severity: newLeads > 5 ? 'medium' : 'low',
            title: `${newLeads} new lead${newLeads > 1 ? 's' : ''} yesterday`,
            description: `You received ${newLeads} new lead${newLeads > 1 ? 's' : ''} on your website.`,
            metric: { name: 'Daily Leads', current: newLeads, previous: 0, change: 0, unit: 'leads' },
          });
        }
      } catch (err) {
        console.error(`Daily insight failed for website ${website._id}:`, (err as Error).message);
      }
    }
  }
}
