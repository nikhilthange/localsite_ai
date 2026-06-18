import { DeploymentRepository } from '../repositories/DeploymentRepository';
import type { IDeployment } from '../../../types/models';
import { S3Storage } from '../../../core/storage/S3Storage';
import { EventBus } from '../../../core/events/EventBus';
import { SystemEvents } from '../../../types/events';
import { AppError } from '../../../utils/AppError';
import { Types } from 'mongoose';
import { Website } from '../../website/models/Website';

export class DeploymentService {
  private repository: DeploymentRepository;

  constructor() {
    this.repository = new DeploymentRepository();
  }

  async deployWebsite(websiteId: string, userId: string) {
    const website = await Website.findOne({ _id: websiteId, userId }).lean();
    if (!website) throw new AppError('Website not found', 404);
    if (website.status !== 'published') throw new AppError('Website must be published before deployment', 400);

    const deployment = await this.repository.create({
      websiteId: new Types.ObjectId(websiteId) as any,
      userId: new Types.ObjectId(userId) as any,
      status: 'pending',
      sslStatus: 'pending',
      cdnEnabled: false,
      buildLogs: [],
    });

    EventBus.emit(SystemEvents.DEPLOYMENT_STARTED, {
      deploymentId: deployment._id.toString(),
      websiteId,
      userId,
      status: 'started',
      timestamp: new Date(),
    });

    try {
      await this.repository.update(deployment._id, {
        status: 'deploying',
        buildLogs: ['Starting deployment...'],
      });

      const html = this.generatePageHtml(website, { slug: 'index' });
      const key = `websites/${websiteId}/index.html`;
      await S3Storage.upload(key, html, 'text/html');

      const url = `https://${website.subdomain}.localsiteai.com`;

      await this.repository.update(deployment._id, {
        status: 'deployed',
        url,
        buildLogs: [...(deployment.buildLogs || []), 'Deployment completed successfully'],
        deployedAt: new Date(),
        sslStatus: 'active',
      });

      await Website.findByIdAndUpdate(websiteId, { deploymentId: deployment._id });

      EventBus.emit(SystemEvents.DEPLOYMENT_COMPLETED, {
        deploymentId: deployment._id.toString(),
        websiteId,
        userId,
        status: 'completed',
        url,
        timestamp: new Date(),
      });

      return this.repository.findById(deployment._id);
    } catch (err) {
      const message = (err as Error).message;
      await this.repository.update(deployment._id, {
        status: 'failed',
        error: message,
        buildLogs: [...(deployment.buildLogs || []), `Failed: ${message}`],
      });

      EventBus.emit(SystemEvents.DEPLOYMENT_FAILED, {
        deploymentId: deployment._id.toString(),
        websiteId,
        userId,
        status: 'failed',
        error: message,
        timestamp: new Date(),
      });

      throw err;
    }
  }

  async getDeploymentStatus(deploymentId: string) {
    const deployment = await this.repository.findById(deploymentId);
    if (!deployment) throw new AppError('Deployment not found', 404);
    return deployment;
  }

  async getDeploymentHistory(websiteId: string): Promise<IDeployment[]> {
    return this.repository.findByWebsiteId(websiteId);
  }

  async setupCustomDomain(deploymentId: string, domain: string) {
    const deployment = await this.repository.findById(deploymentId);
    if (!deployment) throw new AppError('Deployment not found', 404);

    await this.repository.update(deploymentId, {
      customDomain: domain,
      sslStatus: 'pending',
    });

    return this.repository.findById(deploymentId);
  }

  async checkSslStatus(deploymentId: string) {
    const deployment = await this.repository.findById(deploymentId);
    if (!deployment) throw new AppError('Deployment not found', 404);
    return { sslStatus: deployment.sslStatus, customDomain: deployment.customDomain };
  }

  private generatePageHtml(website: any, page: any): string {
    const businessName = website.businessName || website.name;
    const metaTitle = website.seo?.metaTitle || businessName;
    const metaDescription = website.seo?.metaDescription || `${businessName} - Official Website`;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${metaTitle}</title>
        <meta name="description" content="${metaDescription}"/>
        <link rel="stylesheet" href="/style.css"/>
      </head>
      <body>
        <div id="root"></div>
        <script src="/app.js"></script>
      </body>
      </html>
    `.trim();
  }
}
