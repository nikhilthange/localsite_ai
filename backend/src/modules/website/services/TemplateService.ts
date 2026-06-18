import { TemplateRepository } from '../repositories/TemplateRepository';
import { ITemplate } from '../../../types/models';
import { NotFoundError } from '../../../utils/AppError';

export class TemplateService {
  private repository: TemplateRepository;

  constructor() {
    this.repository = new TemplateRepository();
  }

  async getAll(): Promise<ITemplate[]> {
    return this.repository.getAllActive();
  }

  async getById(id: string): Promise<ITemplate> {
    const template = await this.repository.findById(id);
    if (!template) {
      throw new NotFoundError('Template');
    }
    return template;
  }

  async getByCategory(category: string): Promise<ITemplate[]> {
    return this.repository.findByCategory(category);
  }

  async getBySlug(slug: string): Promise<ITemplate> {
    const template = await this.repository.findBySlug(slug);
    if (!template) {
      throw new NotFoundError('Template');
    }
    return template;
  }
}
