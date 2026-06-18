import { BaseRepository } from '../../../core/database/BaseRepository';
import { Deployment } from '../models/Deployment';
import type { IDeployment } from '../../../types/models';
import { Types } from 'mongoose';

export class DeploymentRepository extends BaseRepository<IDeployment> {
  constructor() {
    super(Deployment);
  }

  async findByWebsiteId(websiteId: string | Types.ObjectId) {
    return this.find({ websiteId });
  }

  async findDeployed(websiteId: string | Types.ObjectId) {
    return this.findOne({ websiteId, status: 'deployed' });
  }
}
