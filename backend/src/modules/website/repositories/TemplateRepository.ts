import { Types } from 'mongoose';
import { BaseRepository } from '../../../core/database/BaseRepository';
import { ITemplate } from '../../../types/models';
import { Template } from '../models/Template';

export class TemplateRepository extends BaseRepository<ITemplate> {
  constructor() {
    super(Template);
  }

  async findBySlug(slug: string): Promise<ITemplate | null> {
    return this.findOne({ slug } as any);
  }

  async findByCategory(category: string): Promise<ITemplate[]> {
    return this.find({ category } as any);
  }

  async getAllActive(): Promise<ITemplate[]> {
    return this.find({} as any);
  }
}
